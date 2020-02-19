import { Injectable } from '@angular/core';
import { addressAlumno, addressSmartContractAlumno } from '../config/diplomas-blockchain.config';
import { addressUniversidad, addressSmartContractUniversidad, addressUniversidadClaim } from '../config/diplomas-blockchain.config';
import { addressEmpresa, addressSmartContractEmpresa } from '../config/diplomas-blockchain.config';

// Representa los diferentes roles disponibles en el sistema
export enum IDENTITY_ROLES {ALUMNO = 1, UNIVERSIDAD, EMPRESA}
// Representa a una Identidad Digital en el sistema que puede ser de tipo Claim o Verifier
export enum IDENTITY_TYPE {CLAIM_HOLDER = 1, CLAIM_VERIFIER}

@Injectable({
    providedIn: 'root'
  })
export class IdentidadUNIR {
    public type: number;
    public rol: number;
    public accountAddress: string;
    public accountClaim: string;
    public smartContractAddress: string;
    public instancia: any ;

    constructor(_type: number, _rol: number, _address: string,
        _smartContractAddress: string, _accountClaim:string, _instancia) {
        this.type = _type;
        this.rol = _rol;
        this.accountAddress = _address;
        this.smartContractAddress = _smartContractAddress;
        this.accountClaim = _accountClaim;
        this.instancia = _instancia;
    }
}

// representa las identidades del sistema, este mapa simularia la información
// almacenada por la aplicación en relación a los usuarios... 
export let identidades = new Map<string, IdentidadUNIR>();
identidades.set(addressAlumno, new IdentidadUNIR(IDENTITY_TYPE.CLAIM_HOLDER,
    IDENTITY_ROLES.ALUMNO,
    addressAlumno,
    addressSmartContractAlumno,
    null, null));

identidades.set(addressUniversidad, new IdentidadUNIR(IDENTITY_TYPE.CLAIM_HOLDER,
    IDENTITY_ROLES.UNIVERSIDAD,
    addressUniversidad,
    addressSmartContractUniversidad,
    addressUniversidadClaim,
    null));

identidades.set(addressEmpresa, new IdentidadUNIR(IDENTITY_TYPE.CLAIM_VERIFIER,
    IDENTITY_ROLES.EMPRESA,
    addressEmpresa,
    addressSmartContractEmpresa,
    null, null));

