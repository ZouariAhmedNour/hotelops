import api from './api';
import * as ImagePicker from 'expo-image-picker';

export type CreateTicketPayload = {
  title: string;
  description: string;
  locationId: number;
  categoryId: number;
  priorityId: number;
  reportedFrom?: string;
  urgencyLevel?: number;
  files?: ImagePicker.ImagePickerAsset[];
};

export const ticketService = {
  createTicket: async (data: CreateTicketPayload) => {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('locationId', String(data.locationId));
    formData.append('categoryId', String(data.categoryId));
    formData.append('priorityId', String(data.priorityId));

    if (data.reportedFrom) {
      formData.append('reportedFrom', data.reportedFrom);
    }

    if (data.urgencyLevel !== undefined) {
      formData.append('urgencyLevel', String(data.urgencyLevel));
    }

    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('files', {
          uri: file.uri,
          name: file.fileName || `ticket-${Date.now()}.jpg`,
          type: file.mimeType || 'image/jpeg',
        } as any);
      });
    }

    const response = await api.post('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};