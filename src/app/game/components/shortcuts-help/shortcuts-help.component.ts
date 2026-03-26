import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { GAME_INPUT_FN_BTNS } from '../../../models/constants';

@Component({
  selector: 'app-shortcuts-help',
  templateUrl: './shortcuts-help.component.html',
  styleUrls: ['./shortcuts-help.component.scss'],
  standalone: false,
})
export class ShortcutsHelpComponent {
  readonly formations = GAME_INPUT_FN_BTNS;

  constructor(private modalController: ModalController) {}

  close(): void {
    this.modalController.dismiss();
  }
}
