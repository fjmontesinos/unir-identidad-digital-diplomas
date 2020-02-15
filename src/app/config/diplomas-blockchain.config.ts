export enum IdentityTypes {ClaimHolder, ClaimVerifier}
export enum PURPOSE_TYPES {MANAGEMENT = 1, ACTION, CLAIM, ENCRYPTION}
export enum KEY_TYPES {ECDSA = 1, RSA}
export enum USER_ROLES {ALUMNO = 1, UNIVERSIDAD, EMPRESA}
export enum IDENTITY_TYPE {CLAIM_HOLDER = 1, CLAIM_VERIFIER}


export const RCP_URL_HTTP = 'http://localhost:8545';
export const RCP_URL_WS = 'ws://localhost:8545';
export const CLAIM_TYPE_TITULO_ACADEMICO = 4;

export const addressAlumno = '0x5c4756bb912dea209b94587d4d761ace5d321054';
export const addressUniversidad = '0x951d59346352577920dbb5dca241fc5c346fe950';
export const addressEmpresa = '0x7a55fdcb796ba184fda57530af3303b5553efc56';

export let identidades = new Map();
identidades.set('0x5c4756bb912dea209b94587d4d761ace5d321054', {
    type: IdentityTypes.ClaimHolder,
    rol: USER_ROLES.ALUMNO,
    accountAddress: '0x5c4756bb912dea209b94587d4d761ace5d321054',
    smartContractAddress: '0xCDa08398d531B34fCDF6abFa40CEfd6fb399DA1A',
    instancia: null
});

identidades.set('0x951d59346352577920dbb5dca241fc5c346fe950', {
    type: IdentityTypes.ClaimHolder,
    rol: USER_ROLES.UNIVERSIDAD,
    accountAddress: '0x951d59346352577920dbb5dca241fc5c346fe950',
    smartContractAddress: '0x64fAF8cAa1E5D5ded13AFab5cF2b986121269C5C',
    instancia: null,
    accountClaim: '0xFc83780Dd8bc6eAE4DEe1f12F7976251D2753DfD'
});

identidades.set('0x7a55fdcb796ba184fda57530af3303b5553efc56', {
    type: IdentityTypes.ClaimVerifier,
    rol: USER_ROLES.EMPRESA,
    accountAddress: '0x7a55fdcb796ba184fda57530af3303b5553efc56',
    smartContractAddress: '0xb1a0dEB41a2D4891fD5a107DB3214Dcc8764D8f7',
    instancia: null
});
