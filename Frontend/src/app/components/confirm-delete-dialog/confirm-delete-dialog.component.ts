import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmDeleteDialogData {
  entityLabel: string;
  entityIri: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-6 max-w-md">

      <!-- Header -->
      <div class="flex items-start gap-4 mb-6">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Delete Entity</h2>
          <p class="mt-1 text-sm text-gray-500">This action is irreversible.</p>
        </div>
      </div>

      <!-- Entity info -->
      <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 space-y-2">
        <div>
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Label</span>
          <p class="mt-0.5 text-sm font-medium text-gray-900">{{ data.entityLabel }}</p>
        </div>
        <div>
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">IRI</span>
          <p class="mt-0.5 text-xs font-mono text-gray-600 break-all">{{ data.entityIri }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button
          (click)="onCancel()"
          class="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button
          (click)="onConfirm()"
          class="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Delete
        </button>
      </div>

    </div>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteDialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}