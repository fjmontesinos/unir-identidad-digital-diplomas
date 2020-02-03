import { Component, ViewChild, ElementRef } from '@angular/core';
import { DiplomasBlockchainService } from './services/diplomas-blockchain.service';
import { Title } from '@angular/platform-browser';
import { addressAlumno, addressUniversidad } from './config/diplomas-blockchain.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'UNIR - Identidad Digital';
  accounts = '0x5c4756bb912dea209b94587d4d761ace5d321054;0x951d59346352577920dbb5dca241fc5c346fe950;0x7a55Fdcb796BA184fDA57530af3303b5553efC56'.split(';');
  selectedAccount = '0x5c4756bb912dea209b94587d4d761ace5d321054';
  consola = '';

  @ViewChild('keyPurposeAlumno', {static: true}) keyPurposeAlumnoInput: ElementRef;
  @ViewChild('keyPurposeUniversidad', {static: true}) keyPurposeUniversidadInput: ElementRef;
  @ViewChild('keyPurpose', {static: true}) keyPurpose: ElementRef;
  @ViewChild('keyType', {static: true}) keyType: ElementRef;
  @ViewChild('claim', {static: true}) claim: ElementRef;
  @ViewChild('executionId', {static: true}) executionId: ElementRef;

  constructor(private diplomasBlockchainService: DiplomasBlockchainService,
              private titleServe: Title) {
                this.titleServe.setTitle(this.title);
              }

  onChange(newValue) {
    console.log(newValue);
    this.selectedAccount = newValue;
  }

  limpiarConsola(){
    this.consola = '';
  }

  async getKeyAlumnoByPurpose() {
    const purpose = this.keyPurposeAlumnoInput.nativeElement.value;

    const key = await this.diplomasBlockchainService.getKeyByPurpose(this.selectedAccount, addressAlumno, purpose);
    if ( key !== undefined ) {
       this.consola += '<pre>Clave de tipo ' + purpose + ' del alumno ' + addressAlumno + ':\n' + key + '</pre>';
    } else {
       this.consola += '<pre>El alumno ' + addressAlumno + ' no tiene clave de tipo ' + purpose + '</pre>';
    }
  }

  async getKeyUnivsersidadByPurpose() {
    const purpose = this.keyPurposeUniversidadInput.nativeElement.value;

    const key = await this.diplomasBlockchainService.getKeyByPurpose(this.selectedAccount, addressUniversidad, purpose);
    if ( key !== undefined ) {
      this.consola += '<pre>Clave de tipo ' + purpose + ' de la universidad ' + addressUniversidad + ':\n' + key + '</pre>';
    } else {
      this.consola += '<pre>La universidad ' + addressUniversidad + ' no tiene clave de tipo ' + purpose + '</pre>';
    }
  }

  async addKeyUniversidad() {
    await this.diplomasBlockchainService.addKeyUniversidad(this.selectedAccount,
      this.keyPurpose.nativeElement.value,
      this.keyType.nativeElement.value);
  }

  async addClaimUniversidadToAlumno() {
    const claim = this.claim.nativeElement.value;
    // añadir claim de la universidad al alumno
    await this.diplomasBlockchainService.addClaimUniversidadToAlumno(this.selectedAccount, addressAlumno, claim);
  }

  // response.events.ExecutionRequested.returnValues.executionId
  async aprobarClaimByAlumno( ) {
    const executionId = this.executionId.nativeElement.value;
    // todo recuperar el id de la ejecución
    await this.diplomasBlockchainService.approbarClaimByAlumno(this.selectedAccount, executionId);
  }

  async verificarClaimAlumnoByEmpresa( claimType: number ) {
    // verificar una claim de un alumno
    // await this.blockChainService.verificarClaimAlumno(claimType);
  }
}
