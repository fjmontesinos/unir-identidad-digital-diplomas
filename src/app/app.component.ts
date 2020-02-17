import { Component, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { DiplomasBlockchainService } from './services/diplomas-blockchain.service';
import { Title } from '@angular/platform-browser';
import { addressAlumno, addressUniversidad, addressEmpresa } from './config/diplomas-blockchain.config';
import { identidades, IDENTITY_TYPE, IDENTITY_ROLES } from './model/identidad-unir';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  consola$: Subscription;
  title = 'UNIR :: Identidad Digital - Diplomas';
  accounts = [addressUniversidad, addressAlumno, addressEmpresa];
  selectedAccount = this.accounts[0];
  consola = '';
  disableOpcionesAlumno = false;
  disableOpcionesUniversidad = false;

  @ViewChild('keyPurposeAlumno', {static: true}) keyPurposeAlumnoInput: ElementRef;
  @ViewChild('keyPurposeUniversidad', {static: true}) keyPurposeUniversidadInput: ElementRef;
  @ViewChild('keyPurpose', {static: true}) keyPurpose: ElementRef;
  @ViewChild('keyType', {static: true}) keyType: ElementRef;
  @ViewChild('claim', {static: true}) claim: ElementRef;
  @ViewChild('executionId', {static: true}) executionId: ElementRef;
  @ViewChild('claimType', {static: true}) claimType: ElementRef;

  constructor(private diplomasBlockchainService: DiplomasBlockchainService,
              private ngZone: NgZone,
              private titleServe: Title) {
                this.titleServe.setTitle(this.title);
                this.setSecurityByAccount();
                this.consola$ = this.diplomasBlockchainService.getConsola$().subscribe( (_mensaje) => {
                  this.ngZone.run( () => {
                    this.consola +=  '<pre>' + _mensaje + '</pre>';
                    document.getElementById('consola').scrollTop +=
                      document.getElementById('consola').scrollHeight;
                  });
                });
              }

  onChange(newValue) {
    this.selectedAccount = newValue;
    this.setSecurityByAccount();
  }

  async ngOnDestroy() {
    this.consola$.unsubscribe();
  }

  setSecurityByAccount( ) {
    if ( identidades.get(this.selectedAccount).rol === IDENTITY_ROLES.ALUMNO ) {
      this.disableOpcionesUniversidad = true;
      this.disableOpcionesAlumno = false;
    } else if ( identidades.get(this.selectedAccount).rol === IDENTITY_ROLES.UNIVERSIDAD ) {
      this.disableOpcionesUniversidad = false;
      this.disableOpcionesAlumno = true;
    } else {
      this.disableOpcionesUniversidad = true;
      this.disableOpcionesAlumno = true;
    }
  }

  limpiarConsola() {
    this.consola = '';
  }

  async getKeyAlumnoByPurpose() {
    const purpose = this.keyPurposeAlumnoInput.nativeElement.value;
    await this.diplomasBlockchainService.getKeyByPurpose(this.selectedAccount, addressAlumno, purpose);
  }

  async getKeyUnivsersidadByPurpose() {
    const purpose = this.keyPurposeUniversidadInput.nativeElement.value;
    await this.diplomasBlockchainService.getKeyByPurpose(this.selectedAccount, addressUniversidad, purpose);
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

  async verificarClaimIdentidadByEmpresa( ) {
    const claimType = this.claimType.nativeElement.value;
    // verificar una claim de una identidad
    await this.diplomasBlockchainService.verificarClaimIdentidadByEmpresa(this.selectedAccount, this.selectedAccount, claimType);
  }

  async deployIdentidadesDigitales() {
    await this.diplomasBlockchainService.deployIdentidadDigital(addressAlumno, IDENTITY_TYPE.CLAIM_HOLDER);
    await this.diplomasBlockchainService.deployIdentidadDigital(addressUniversidad, IDENTITY_TYPE.CLAIM_HOLDER);
    await this.diplomasBlockchainService.deployIdentidadDigital(addressEmpresa, IDENTITY_TYPE.CLAIM_VERIFIER);
    await this.diplomasBlockchainService.initIdentidadesDigitales();

    this.consola +=  'Identidades Digitales Desplegadas';
  }

  isIdentidadesDigitalesDesplegadas() {
    return this.diplomasBlockchainService.isIdentidadesDigitalesDesplegadas();
  }

}
