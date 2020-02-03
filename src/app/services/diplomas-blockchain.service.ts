import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { claimHolderABI, claimHolderBytecode } from '../contracts/claimHolder';
import { claimVerifierABI,claimVerifierBytecode } from '../contracts/claimVerifier';
import { RCP_URL, identidades, IdentityTypes, CLAIM_TYPE_TITULO_ACADEMICO, KEY_TYPES, addressAlumno, RCP_URL_WS } from '../config/diplomas-blockchain.config';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class DiplomasBlockchainService {

  private accountUniClaim = '0xFc83780Dd8bc6eAE4DEe1f12F7976251D2753DfD';
  private web3: any;

  constructor() {
    this.init();
  }

  async init() {
    // inicializar web3
    // window.web3 = new Web3(new Web3.providers.HttpProvider(RCP_URL));
    window.web3 = new Web3(new Web3.providers.WebsocketProvider(RCP_URL_WS));

    this.web3 = window.web3;

    // inicializar las instancias de los contratos
    for ( let identidad of identidades.values() ) {
      if ( identidad.type === IdentityTypes.ClaimHolder ) {
        identidad.instancia = new this.web3.eth.Contract(claimHolderABI, identidad.smartContractAddress);
      } else if ( identidad.type === IdentityTypes.ClaimVerifier ) {
        identidad.instancia = new this.web3.eth.Contract(claimVerifierABI, identidad.smartContractAddress);
      }
    }
  }

  /**
   * Desplegar smart contract
   * @param address dirección propietario del smart contract
   */
  async deploySmartContract( address: string ) {
    let c = new this.web3.eth.Contract(claimHolderABI);
    let payload = { data: claimHolderBytecode };

    let parameters = {
      from: address,
      gas: this.web3.utils.toHex(800000),
      gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('30', 'gwei'))
    };

    c.deploy(payload).send(parameters, (err, transactionHash) => {
      console.log('Transaction hash: ', transactionHash);
    }).on('confirmation', () => {}).then(
      (newContracInstance) => {
        // establecer la instancia
        identidades.get(newContracInstance.options.address).instancia = newContracInstance;
        console.log('Contrato Desplegado: ', newContracInstance.options.address);
      }
    );

  }

  async getKeyByPurpose( addressFrom: string, address: string, purpose: number ): Promise<any> {
    return new Promise((resolve, reject) => {
      identidades.get(address).instancia.methods.getKeysByPurpose(purpose).call({
        from: addressFrom,
        gas: 30000
      }, (error: any, result: any) => {
          if (!error) {
              // console.log(result);
              if (result.length > 0) {
                  console.log('Clave de tipo ' + purpose + ' de ' + address + ' : '  + result);
                  resolve(result);
              } else {
                  console.log('La identidad asocida a ' + address + ' no tiene clave de tipo: ' + purpose);
                  resolve(undefined);
              }
          } else {
              console.error('Error: ' + error);
              reject(error);
          }
      });
    }) as Promise<any>;
  }

  // private generateKey() {
  //   let privateKey = this.web3.utils.randomHex(32);
  //   for (let i = privateKey.length; i < 66; i++) {
  //       privateKey += '0';
  //   }
  //   const publicKey = this.web3.eth.accounts.privateKeyToAccount(privateKey).address;
  //   const key = this.web3.utils.sha3(publicKey);

  //   return {
  //       privateKey,
  //       publicKey,
  //       key
  //   };
  // }

  // Añadir clave a la universidad para firmar alegaciones (addKey)
  async addKeyUniversidad( addressFrom: string, purpose: number, type: number ) {
    const claimKey = this.web3.utils.keccak256(this.accountUniClaim);

    // Usar la función instanciaUni.methods.addKey() de tipo CLAIM
    identidades.get(addressFrom).instancia.methods.addKey(
      claimKey,
      purpose,
      type
    ).send({
        from: addressFrom,
        gas: 600000
    }, (error: any, result: any) => {
        if (!error) {
            console.log('Clave con id: ' + claimKey +
            ' para CLAIM añadida a la identidad de la uni para la dirección: ' + this.accountUniClaim);
        } else {
            console.error('Erro: ' + error);
        }
    });
  }

  async addClaimUniversidadToAlumno( addressFrom: string, alumnoAccount: string, alegacion: string ) {
    console.log(identidades.get(addressFrom).keyClaim);

    const hexedData = this.web3.utils.asciiToHex(alegacion);
    console.log('hexedData: ' + hexedData);

    const hashedDataToSign = this.web3.utils.soliditySha3(
      identidades.get(alumnoAccount).smartContractAddress,
      CLAIM_TYPE_TITULO_ACADEMICO,
      hexedData);
    console.log('hashedData: ' + hashedDataToSign);

    const signature = await this.web3.eth.sign(hashedDataToSign, this.accountUniClaim);
    console.log('signature: ' + signature);

    // Obtener Abi de instanciaAlumno.methods.addClaim()
    const claimAbi = await identidades.get(alumnoAccount).instancia.methods.addClaim(
        CLAIM_TYPE_TITULO_ACADEMICO, // Certificado de universidad
        KEY_TYPES.ECDSA, // ECDSA
        identidades.get(addressFrom).smartContractAddress,
        signature,
        hexedData,
        "http://montesinos.org.es"
    ).encodeABI();
    console.log('claimabi: ' + claimAbi);

    // capturar evento para obtener el id de ejecución
    // tslint:disable-next-line: prefer-const
    identidades.get(alumnoAccount).instancia.events.ExecutionRequested({}, ( error, result ) => {
      if ( !error ) {
        console.log(result);
        const ejeccionId = result.returnValues.executionId;
        alert(ejeccionId);
      }
    });

    // ejecutar el añadido de la claim en la identidad del alumno
    identidades.get(alumnoAccount).instancia.methods.execute(
        identidades.get(alumnoAccount).smartContractAddress,
        0,
        claimAbi
    ).send({
        from: addressAlumno, // identidades.get(alumnoAccount).accountAddress,
        gas: 900000
    }, (error: any, result: any) => {
        if (!error) {
          console.log('Claim añadido a la identidad del alumno');

        } else {
          console.error(error);

        }
    });
  }

  // Aprobar la alegación añadida por la universidad al Alumno (approve),
  // ya que la Universidad la ha expedido pero el alumno debe aprobarla
  async approbarClaimByAlumno( id: number ) {
    // Usar la función instanciaAlumno.methods.approve()
    // ejecutar el añadido de la claim en la identidad del alumno
    // identidadAlumno.instancia.methods.approve(
    //     1,
    //     true
    // ).send({
    //     from: identidadAlumno.accountAddress,
    //     gas: 300000
    // }, (error: any, result: any) => {
    //     if (!error) {
    //         // console.log(result);
    //         console.log('Claim aprobado por el alumno ' + result);
    //     } else {
    //         console.error(error);
    //     }
    // });
  }

  // Verificar la alegación por parte de la empresa (checkClaim)
  // de que el alumno tiene ese claim y es válido y está aprobado
  async verificarClaimAlumno(tipoClaim: number) {
    // Usar la función  instanciaEmpresa.methods.checkClaim()
    // identidadEmpresa.instancia.methods.checkClaim(
    //     identidadUniversidad.smartContractAddress,
    //     tipoClaim
    // ).send({
    //     from: identidadEmpresa.accountAddress,
    //     gas: 300000
    // }, (error: any, result: any) => {
    //     if (!error) {
    //       console.log('Claim ' + tipoClaim + ' verificado por la empresa para la identidad: ' + identidadAlumno.smartContractAddress);

    //     } else {
    //         console.error(error);

    //     }
    // });
  }


}
