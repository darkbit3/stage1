const axios = require('axios');
require('dotenv').config();

class DatabaseManager {
  constructor() {
    this.dbManagerUrl = `http://localhost:${process.env.DB_MANAGER_PORT || 3007}`;
    this.apiKey = process.env.BIGSERVER_API_KEY;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds cache
  }

  /**
   * Make authenticated request to DB Manager
   */
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.dbManagerUrl}${endpoint}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`DB Manager request failed:`, error.message);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Get Stage A model operations
   */
  async getStageA(filters = {}) {
    const cacheKey = `stage_a_${JSON.stringify(filters)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await this.makeRequest('/api/v1/stage-a', 'GET', { filters });
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      return response;
    } catch (error) {
      console.error('Failed to get Stage A data:', error);
      throw error;
    }
  }

  async createStageA(data) {
    return this.makeRequest('/api/v1/stage-a', 'POST', data);
  }

  async updateStageA(id, data) {
    return this.makeRequest(`/api/v1/stage-a/${id}`, 'PUT', data);
  }

  async deleteStageA(id) {
    return this.makeRequest(`/api/v1/stage-a/${id}`, 'DELETE');
  }

  /**
   * Get Stage B model operations
   */
  async getStageB(filters = {}) {
    const cacheKey = `stage_b_${JSON.stringify(filters)}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await this.makeRequest('/api/v1/stage-b', 'GET', { filters });
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
      return response;
    } catch (error) {
      console.error('Failed to get Stage B data:', error);
      throw error;
    }
  }

  async createStageB(data) {
    return this.makeRequest('/api/v1/stage-b', 'POST', data);
  }

  async updateStageB(id, data) {
    return this.makeRequest(`/api/v1/stage-b/${id}`, 'PUT', data);
  }

  async deleteStageB(id) {
    return this.makeRequest(`/api/v1/stage-b/${id}`, 'DELETE');
  }

  /**
   * Get player's section data
   */
  async getPlayerSection(playerId) {
    try {
      const response = await this.makeRequest(`/api/v1/section-management/player/${playerId}`);
      return response;
    } catch (error) {
      console.error(`Failed to get player section data for ${playerId}:`, error);
      throw error;
    }
  }

  /**
   * Update player's stage data
   */
  async updatePlayerStage(playerId, stage, data) {
    try {
      const updateData = {
        playerId,
        [`stage${stage.toUpperCase()}`]: data,
        lastActiveAt: new Date()
      };
      
      return this.makeRequest(`/api/v1/section-management/player/${playerId}`, 'PUT', updateData);
    } catch (error) {
      console.error(`Failed to update player ${playerId} stage ${stage}:`, error);
      throw error;
    }
  }

  /**
   * Get database status
   */
  async getDatabaseStatus() {
    return this.makeRequest('/database-status');
  }

  /**
   * Get model status
   */
  async getModelStatus() {
    return this.makeRequest('/model-status');
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Health check for DB Manager
   */
  async healthCheck() {
    try {
      const response = await this.makeRequest('/health');
      return {
        isHealthy: true,
        data: response
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error.message
      };
    }
  }
}

module.exports = DatabaseManager;
