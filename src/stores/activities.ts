import { defineStore } from 'pinia'
import axios from 'axios'
import type { Activity } from '../types'
import { API_CONFIG } from '@/config/api'

const API_BASE_URL = API_CONFIG.BASE_URL

interface ActivityFilters {
  assignedTo?: string
  status?: string
}

export const useActivitiesStore = defineStore('activities', {
  state: () => ({
    activities: [] as Activity[],
    loading: false,
    error: null as string | null
  }),
  actions: {
    fetchActivities(filters?: ActivityFilters) {
      this.loading = true;
      let url = `${API_BASE_URL}/activities`;
      if (filters && filters.assignedTo) {
        url = `${API_BASE_URL}/activities/assigned/${filters.assignedTo}`;
      } else if (filters && filters.status) {
        const params = new URLSearchParams();
        params.append('status', filters.status);
        url += `?${params.toString()}`;
      }
      return axios.get(url)
        .then(response => {
          this.activities = response.data;
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error fetching activities';
          console.error('Error fetching activities:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fetchMyPendingActivities() {
      this.loading = true;
      return axios.get(`${API_BASE_URL}/activities/mine`)
        .then(response => {
          this.activities = response.data;
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error fetching my pending activities';
          console.error('Error fetching my pending activities:', error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    createActivity(activityData: Partial<Activity>) {
      this.loading = true;
      return axios.post(`${API_BASE_URL}/activities`, activityData)
        .then(response => {
          this.activities.push(response.data);
          this.error = null;
          return response.data;
        })
        .catch(error => {
          this.error = error.message || 'Error creating activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    updateActivity(activityId: string, activityData: Partial<Activity>) {
      this.loading = true;
      return axios.put(`${API_BASE_URL}/activities/${activityId}`, activityData)
        .then(response => {
          const index = this.activities.findIndex(a => a._id === activityId);
          if (index !== -1) {
            this.activities[index] = response.data;
          }
          this.error = null;
          return response.data;
        })
        .catch(error => {
          this.error = error.message || 'Error updating activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    deleteActivity(activityId: string) {
      this.loading = true;
      return axios.delete(`${API_BASE_URL}/activities/${activityId}`)
        .then(() => {
          this.activities = this.activities.filter(a => a._id !== activityId);
          this.error = null;
        })
        .catch(error => {
          this.error = error.message || 'Error deleting activity';
          throw error;
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
})
