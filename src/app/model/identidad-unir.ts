import { Injectable } from '@angular/core';

/**
 * Representa a una Identidad Digital en el sistema que puede ser de tipo Verifier o 
 */
export enum IDENTITY_ROLES {ALUMNO = 1, UNIVERSIDAD, EMPRESA}
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