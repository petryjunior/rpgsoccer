import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LocalStorageService } from '../../../services/local-storage.service';
import { STORAGE_KEY } from '../../../models/constants';

const MAX_LEN = 12000;

@Component({
  selector: 'app-manager-notebook',
  templateUrl: './manager-notebook.component.html',
  styleUrls: ['./manager-notebook.component.scss'],
  standalone: false,
})
export class ManagerNotebookComponent implements OnInit {
  readonly maxLen = MAX_LEN;
  notes = '';
  saving = false;

  constructor(
    private modalController: ModalController,
    private storageService: LocalStorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    const saved = await this.storageService.get<string>(STORAGE_KEY.MANAGER_NOTEBOOK);
    this.notes = saved ?? '';
  }

  async saveAndClose(): Promise<void> {
    await this.persist();
    await this.modalController.dismiss();
  }

  async dismiss(): Promise<void> {
    await this.persist();
    await this.modalController.dismiss();
  }

  onNotesInput(): void {
    if (this.notes.length > MAX_LEN) {
      this.notes = this.notes.slice(0, MAX_LEN);
    }
  }

  private async persist(): Promise<void> {
    this.saving = true;
    try {
      await this.storageService.set(STORAGE_KEY.MANAGER_NOTEBOOK, this.notes);
    } finally {
      this.saving = false;
    }
  }
}
