import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';

export interface SyncAction {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data: Record<string, any>;
  createdAt: string;
}

const KEY_QUEUE = 'offline_sync_queue';

export class SyncQueueService {
  static async enqueue(
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data: Record<string, any>
  ): Promise<void> {
    const queue = await this.getQueue();
    const action: SyncAction = {
      id: Date.now().toString(),
      method,
      endpoint,
      data,
      createdAt: new Date().toISOString(),
    };
    queue.push(action);
    await AsyncStorage.setItem(KEY_QUEUE, JSON.stringify(queue));
  }

  static async getQueue(): Promise<SyncAction[]> {
    const raw = await AsyncStorage.getItem(KEY_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(KEY_QUEUE);
  }

  static async processQueue(): Promise<void> {
    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const remaining: SyncAction[] = [];

    for (const action of queue) {
      try {
        if (action.method === 'POST') {
          await apiClient.post(action.endpoint, action.data);
        } else if (action.method === 'PUT') {
          await apiClient.put(action.endpoint, action.data);
        } else if (action.method === 'DELETE') {
          await apiClient.delete(action.endpoint, { data: action.data });
        }
      } catch (err: any) {
        // If network error / timeout, retain in queue
        if (!err.response) {
          remaining.push(action);
        }
      }
    }

    await AsyncStorage.setItem(KEY_QUEUE, JSON.stringify(remaining));
  }
}
