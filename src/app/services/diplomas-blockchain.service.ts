import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { claimHolderABI, claimHolderBytecode } from '../contracts/claimHolder';
import { claimVerifierABI, claimVerifierBytecode } from '../contracts/claimVerifier';
import { addressAlumno, addressUniversidad, addressEmpresa } from '../config/diplomas-blockchain.config';
import { KEY_TYPES, RCP_URL_WS, CLAIM_TYPES } from '../config/diplomas-blockchain.config';
import { identidades, IDENTITY_TYPE } from '../model/identidad-unir';
import { Subject, Observable } from 'rxjs';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class DiplomasBlockchainService {

  public consola$ = new Subject<string>();

  private totalIdentidadesDesplegadas = 0;
  private web3: any;

  constructor() {
    this.init();
  }

  getConsola$(): Observable<string> {
    return this.consola$.asObservable();
  }

  async init() {
    // inicializar web3
    // necesario para que se confirmen las transacciones 
    // desde el segundo bloque en la versión 1.0.0-beta.55 de web3
    const optionsProvider = {
      transactionConfirmationBlocks: 1
    };

    window.web3 = new Web3(new Web3.providers.WebsocketProvider(RCP_URL_WS), null, optionsProvider);
    this.web3 = window.web3;

    this.initIdentidadesDigitales();
  }

  async initIdentidadesDigitales() {
    // inicializar las instancias de los contratos
    for ( let identidad of identidades.values() ) {
      if ( identidad.type === IDENTITY_TYPE.CLAIM_HOLDER ) {
        identidad.instancia = new this.web3.eth.Contract(claimHolderABI, identidad.smartContractAddress);
      } else if ( identidad.type === IDENTITY_TYPE.CLAIM_VERIFIER ) {
        identidad.instancia = new this.web3.eth.Contract(claimVerifierABI, identidad.smartContractAddress);
      }

      // Verificar si la identidad está desplegada en la red blockchain
      const code = await this.web3.eth.getCode(identidad.smartContractAddress);
      // Si el code es distinto de 0x -> el contrato está desplegado
      if ( code !== '0x' ) {
        this.totalIdentidadesDesplegadas++;
      }
    }

    // Si se han desplegado las 3 identidades -> añadimos los listeners a las diferentes instancias
    if ( this.totalIdentidadesDesplegadas === 3 ) {
      // capturar evento para obtener el id de ejecución
      identidades.get(addressAlumno).instancia.events.ExecutionRequested({}, ( error, result ) => {
        if ( !error ) {
          const mensaje = 'CLAIM añadido con id de ejecución: ' + result.returnValues.executionId;
          this.consola$.next(mensaje);
        } else {
          this.consola$.next('Error: ' + error);
        }
      });

      // capturar evento para obtener claim valido
      identidades.get(addressEmpresa).instancia.events.ClaimValid({}, ( error, result ) => {
        if ( !error ) {
          this.consola$.next('CLAIM válido');
        } else {
          this.consola$.next('Error: ' + error);
        }
      });

      // capturar evento para obtener claim NO valido
      identidades.get(addressEmpresa).instancia.events.ClaimInvalid({}, ( error, result ) => {
        if ( !error ) {
          this.consola$.next('CLAIM NO válido');
        } else {
          this.consola$.next('Error: ' + error);
        }
      });
    }
  }

  /**
   * Desplegar smart contract de identidad
   * @param address dirección propietario del smart contract
   * @param identidadType tipo de indentidad que se desea desplegar
   */
  async deployIdentidadDigital( address: string, identidadType: number ) {
    let c: any;
    let payload: any ;
    if ( identidadType === IDENTITY_TYPE.CLAIM_HOLDER ) {
      c = new this.web3.eth.Contract(claimHolderABI);
      payload = { data: '0x' + claimHolderBytecode };

    } else if ( identidadType === IDENTITY_TYPE.CLAIM_VERIFIER ) {
      c = new this.web3.eth.Contract(claimVerifierABI);
      // En el caso de ser verifier debemos informar como argumento del constructor
      // la dirección del smartcontract del issuer (Universidad)
      payload = {
        data: '0x' + claimVerifierBytecode,
        arguments: [identidades.get(addressUniversidad).smartContractAddress]
      };
    }

    // Estimación del gas a utilizar
    const estimatedGas = await c.deploy(payload).estimateGas({from: address});
    const parameters = {
      from: address,
      gas: estimatedGas + 1
    };

    // Desplegar el contrato en la red
    c.deploy(payload)
      .send(parameters)
      .on('error', ( error ) => {
        console.log(error);
      })
      .on('receipt', ( receipt ) => {
        console.log(receipt);
      });
  }
  /**
   * Verifica si se han desplegado las 3 identidades necesarias de la práctica
   */
  isIdentidadesDigitalesDesplegadas() {
    if ( this.totalIdentidadesDesplegadas === 3 ) {
      return true;
    } else {
      return false;
    }
  }

  async getKeyByPurpose( addressFrom: string, address: string, purpose: number ): Promise<any> {
    // Estimación del gas a utilizar
    const estimatedGas = await identidades.get(address).instancia.methods.getKeysByPurpose(purpose).estimateGas({
        from: addressFrom
      }
    );

    return new Promise((resolve, reject) => {
      identidades.get(address).instancia.methods.getKeysByPurpose(purpose).call({
        from: addressFrom,
        gas: estimatedGas + 1
      }, (error: any, result: any) => {
          if (!error) {
              // console.log(result);
              if (result.length > 0) {
                  this.consola$.next('Clave de tipo ' + purpose + ' de ' + address + ':\n'  + result);
                  resolve(result);
              } else {
                  this.consola$.next('La identidad de ' + address + ' no tiene clave de tipo: ' + purpose);
                  resolve(undefined);
              }
          } else {
              this.consola$.next('Error: ' + error);
              reject(error);
          }
      });
    }) as Promise<any>;
  }

  /**
   * Añadir clave a la universidad para firmar alegaciones (addKey)
   * @param addressFrom 
   * @param purpose 
   * @param type 
   */
  async addKeyUniversidad( addressFrom: string, purpose: number, type: number ) {
    const claimKey = this.web3.utils.keccak256(identidades.get(addressFrom).accountClaim);

    // Estimación del gas a utilizar
    const estimatedGas = await identidades.get(addressFrom).instancia.methods.addKey(
      claimKey,
      purpose,
      type
    ).estimateGas({from: addressFrom});

    this.consola$.next('Gas estimado para añadir la key: ' + estimatedGas);

    // Usar la función instanciaUni.methods.addKey() de tipo CLAIM
    identidades.get(addressFrom).instancia.methods.addKey(
      claimKey,
      purpose,
      type
    ).send({
        from: addressFrom,
        gas: estimatedGas + 1
    }, (error: any, result: any) => {
        if (!error) {
          this.consola$.next('Añadida clave de tipo ' + purpose + ' para la dirección: ' +
            identidades.get(addressFrom).accountClaim + ':\n'
            + 'Key: ' + claimKey);
        } else {
          this.consola$.next('Error: ' + error);
        }
    });
  }

  async addClaimUniversidadToAlumno( addressFrom: string, alumnoAccount: string, alegacion: string ) {
    const hexedData = this.web3.utils.asciiToHex(alegacion);
    // console.log('hexedData: ' + hexedData);

    const hashedDataToSign = this.web3.utils.soliditySha3(
      identidades.get(alumnoAccount).smartContractAddress,
      CLAIM_TYPES.TITULO_ACADEMICO,
      hexedData);
    // console.log('hashedData: ' + hashedDataToSign);

    const signature = await this.web3.eth.sign(hashedDataToSign, identidades.get(addressFrom).accountClaim);
    // console.log('signature: ' + signature);

    // Obtener Abi de instanciaAlumno.methods.addClaim()
    const claimAbi = await identidades.get(alumnoAccount).instancia.methods.addClaim(
        CLAIM_TYPES.TITULO_ACADEMICO, // Certificado de universidad
        KEY_TYPES.ECDSA, // ECDSA
        identidades.get(addressFrom).smartContractAddress,
        signature,
        hexedData,
        "http://montesinos.org.es"
    ).encodeABI();
    // console.log('claimabi: ' + claimAbi);

    // Estimación del gas a utilizar
    const estimatedGas = await identidades.get(alumnoAccount).instancia.methods.execute(
      identidades.get(alumnoAccount).smartContractAddress,
      0,
      claimAbi
    ).estimateGas({from: addressFrom});

    this.consola$.next('Gas estimado para añadir el CLAIM: ' + estimatedGas);

    // ejecutar el añadido de la claim en la identidad del alumno
    identidades.get(alumnoAccount).instancia.methods.execute(
        identidades.get(alumnoAccount).smartContractAddress,
        0,
        claimAbi
    ).send({
        from: addressFrom, // identidades.get(alumnoAccount).accountAddress,
        gas: estimatedGas + 1
    }, (error: any, result: any) => {
        if (!error) {
          this.consola$.next('CLAIM añadido a la identidad del alumno correctamente');

        } else {
          this.consola$.next('Error: ' + error);

        }
    });
  }

  // Aprobar la alegación añadida por la universidad al Alumno (approve),
  // ya que la Universidad la ha expedido pero el alumno debe aprobarla
  async approbarClaimByAlumno( addressFrom: string, executionId: number ) {
    // Estimar el gas necesario
    const estimatedGas = await identidades.get(addressFrom).instancia.methods.approve(
      executionId,
      true
    ).estimateGas({from: addressFrom});

    this.consola$.next('Gas estimado para aprobar el CLAIM: ' + estimatedGas);

    // Usar la función instanciaAlumno.methods.approve()
    // ejecutar el añadido de la claim en la identidad del alumno
    identidades.get(addressFrom).instancia.methods.approve(
        executionId,
        true
    ).send({
        from: addressFrom,
        gas: estimatedGas + 1
    }, (error: any, result: any) => {
        if (!error) {
            // console.log(result);
            this.consola$.next('CLAIM aprobado por el alumno');
        } else {
          this.consola$.next('Error: ' + error);
        }
    });
  }

  // Verificar la alegación por parte de la empresa (checkClaim)
  // de que una identidad tiene el claim solicitado es válido y está aprobado
  async verificarClaimIdentidadByEmpresa( addressFrom: string, alumnoAccount: string, tipoClaim: number) {
    // Estimar el gas necesario
    const estimatedGas = await identidades.get(addressEmpresa).instancia.methods.checkClaim(
        identidades.get(alumnoAccount).smartContractAddress,
        tipoClaim
    ).estimateGas({from: addressFrom});

    this.consola$.next('Gas estimado para verificar el CLAIM: ' + estimatedGas);

    //  Usar la función  instanciaEmpresa.methods.checkClaim()
    identidades.get(addressEmpresa).instancia.methods.checkClaim(
        identidades.get(alumnoAccount).smartContractAddress,
        tipoClaim
    ).send({
        from: addressFrom,
        gas: estimatedGas +  1
    }, (error: any, result: any) => {
        if (error) {
          this.consola$.next('Error: ' + error);
        }
    });
  }


}
