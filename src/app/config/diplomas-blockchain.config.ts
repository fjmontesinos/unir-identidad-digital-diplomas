export enum IdentityTypes {ClaimHolder, ClaimVerifier}
export enum PURPOSE_TYPES {MANAGEMENT = 1, ACTION, CLAIM, ENCRYPTION}
export enum KEY_TYPES {ECDSA = 1, RSA}


export const RCP_URL = 'http://localhost:8545';
export const RCP_URL_WS = 'ws://localhost:8545';
export const CLAIM_TYPE_TITULO_ACADEMICO = 4;

export const addressAlumno = '0x5c4756bb912dea209b94587d4d761ace5d321054';
export const addressUniversidad = '0x951d59346352577920dbb5dca241fc5c346fe950';
export const addressEmpresa = '0x7a55fdcb796ba184fda57530af3303b5553efc56';

export let identidades = new Map();
identidades.set('0x5c4756bb912dea209b94587d4d761ace5d321054', {
    type: IdentityTypes.ClaimHolder,
    accountAddress: '0x5c4756bb912dea209b94587d4d761ace5d321054',
    smartContractAddress: '0xCDa08398d531B34fCDF6abFa40CEfd6fb399DA1A',
    instancia: null
});

identidades.set('0x951d59346352577920dbb5dca241fc5c346fe950', {
    type: IdentityTypes.ClaimHolder,
    accountAddress: '0x951d59346352577920dbb5dca241fc5c346fe950',
    smartContractAddress: '0x64fAF8cAa1E5D5ded13AFab5cF2b986121269C5C',
    instancia: null,
    keyClaim: {privateKey: "0x52f4d205ec73f3ebad7f1823be96f1f29c0fee9b176aab7eb5b489539b852f61", publicKey: "0xCB84E24Ac3287E52A079Fc146C530C042824Dcb3", key: "0x1da9e1d249bfddd1a17c76ff52581f7d55e9ae65e449a95da5be1447b7925fd5"}
});

identidades.set('0x7a55Fdcb796BA184fDA57530af3303b5553efC56', {
    type: IdentityTypes.ClaimVerifier,
    accountAddress: '0x7a55fdcb796ba184fda57530af3303b5553efc56',
    smartContractAddress: '0xb1a0dEB41a2D4891fD5a107DB3214Dcc8764D8f7',
    instancia: null
});
