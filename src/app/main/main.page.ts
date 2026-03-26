import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

type RadioStation = {
  band: string;
  frequency: string;
  name: string;
  blurb: string;
};

@Component({
    selector: 'app-main',
    templateUrl: './main.page.html',
    styleUrls: ['./main.page.scss'],
    standalone: false
})
export class MainPage {
  readonly radioStations: RadioStation[] = [
    {
      band: 'FM',
      frequency: '97.3',
      name: 'Batata FM',
      blurb:
        'Nutrição tática ao vivo: “batata no intervalo é intervalo campeão”. Patrocínio imaginário da lavoura.',
    },
    {
      band: 'AM',
      frequency: '880',
      name: 'Meia Velha AM',
      blurb:
        'Plantão do vestiário: cheiro de grama, fita adesiva e aquela meia que só sai pra final. Sorte questionável, coração de titular.',
    },
    {
      band: 'SW',
      frequency: '11m',
      name: 'Pirata do Ar',
      blurb:
        'Estática bonita, chiado nostálgico e boato de escalação vinda de rádio de pilha. Não confie no 4-4-2 que você ouviu nas ondas curtas.',
    },
  ];

  radioStationIndex = 0;
  radioPowered = true;
  socksModalOpen = false;
  private potatoClicks = 0;

  constructor(private toastController: ToastController) {}

  get currentStation(): RadioStation {
    return this.radioStations[this.radioStationIndex];
  }

  tunePrev(): void {
    if (!this.radioPowered) {
      return;
    }
    this.radioStationIndex =
      (this.radioStationIndex - 1 + this.radioStations.length) %
      this.radioStations.length;
  }

  tuneNext(): void {
    if (!this.radioPowered) {
      return;
    }
    this.radioStationIndex =
      (this.radioStationIndex + 1) % this.radioStations.length;
  }

  toggleRadioPower(): void {
    this.radioPowered = !this.radioPowered;
  }

  openSocksModal(): void {
    this.socksModalOpen = true;
  }

  closeSocksModal(): void {
    this.socksModalOpen = false;
  }

  async onPotatoTap(): Promise<void> {
    this.potatoClicks += 1;
    let message = '';
    if (this.potatoClicks === 1) {
      message = 'Batata anotada no caderno da comissão técnica.';
    } else if (this.potatoClicks === 3) {
      message = 'Três batatas: o vestiário começa a desconfiar da tática.';
    } else if (this.potatoClicks === 7) {
      message =
        'A Batata Suprema promove você a técnico honorário do departamento de raízes.';
    } else {
      message = `Batata ${this.potatoClicks} — o gramado sente sua presença.`;
    }
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color: 'secondary',
    });
    await toast.present();
  }
}
