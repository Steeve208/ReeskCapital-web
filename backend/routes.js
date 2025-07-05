const express = require('express');
const axios = require('axios');
const router = express.Router();

const BLOCKCHAIN_API = 'https://rsc-chain-production.up.railway.app';

// --- SESIONES DE MINERÍA EN MEMORIA ---
const miningSessions = {};

// Wallet
router.post('/wallet/create', (req, res) => {
  // Crear wallet (proxy a blockchain)
  res.json({ message: 'Crear wallet (no implementado)' });
});

// Obtener balance real
router.get('/wallet/balance', async (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Dirección inválida' });
  }
  try {
    const response = await axios.get(`${BLOCKCHAIN_API}/wallet/balance`, { params: { address } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando balance', details: err.message });
  }
});

// Obtener historial de transacciones real
router.get('/wallet/transactions', async (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Dirección inválida' });
  }
  try {
    const response = await axios.get(`${BLOCKCHAIN_API}/wallet/transactions`, { params: { address } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error consultando transacciones', details: err.message });
  }
});

// Mining
router.post('/mining/start', (req, res) => {
  const { address, start } = req.body;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Dirección inválida' });
  }
  const now = start || Date.now();
  const session = miningSessions[address];
  if (session && now - session.start < 24 * 60 * 60 * 1000) {
    return res.status(403).json({ error: 'Ya tienes una sesión de minería activa. Espera 24h.' });
  }
  miningSessions[address] = { start: now };
  res.json({ message: 'Sesión de minería iniciada', start: now });
});

// Staking
router.post('/staking/delegate', async (req, res) => {
  const { address, amount, validator } = req.body;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address) || !amount || isNaN(amount) || !validator) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  try {
    const response = await axios.post(`${BLOCKCHAIN_API}/staking/delegate`, { address, amount, validator });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error delegando tokens', details: err.message });
  }
});

// Staking - Pools y Validadores simulados
router.get('/staking/pools', (req, res) => {
  // Si la blockchain expone pools, hacer proxy aquí. Si no, simular:
  res.json({ pools: [
    { id: 'pool1', name: 'RSC Premium', apy: 13.2, minStake: 1000, maxStake: 100000, totalStaked: 1250000, participants: 1250, risk: 'low', badge: 'Popular' },
    { id: 'pool2', name: 'RSC Standard', apy: 11.8, minStake: 500, maxStake: 50000, totalStaked: 850000, participants: 2100, risk: 'low', badge: 'Stable' },
    { id: 'pool3', name: 'RSC Flex', apy: 10.5, minStake: 100, maxStake: 25000, totalStaked: 450000, participants: 3200, risk: 'low', badge: 'Flexible' },
    { id: 'pool4', name: 'RSC High Yield', apy: 15.8, minStake: 5000, maxStake: 200000, totalStaked: 750000, participants: 450, risk: 'medium', badge: 'High APY' }
  ] });
});
router.get('/staking/validators', (req, res) => {
  res.json({ validators: [
    { id: 'val1', name: 'Validator Alpha', commission: 5.0, uptime: 99.8, totalStaked: 450000, delegators: 1250, status: 'active' },
    { id: 'val2', name: 'Validator Beta', commission: 3.5, uptime: 99.9, totalStaked: 380000, delegators: 980, status: 'active' },
    { id: 'val3', name: 'Validator Gamma', commission: 7.2, uptime: 99.5, totalStaked: 290000, delegators: 750, status: 'active' }
  ] });
});

// P2P
router.get('/p2p/orders', async (req, res) => {
  try {
    const response = await axios.get(`${BLOCKCHAIN_API}/p2p/orders`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error listando órdenes P2P', details: err.message });
  }
});
router.post('/p2p/orders', async (req, res) => {
  const { address, type, amount, price } = req.body;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address) || !type || !amount || isNaN(amount) || !price || isNaN(price)) {
    return res.status(400).json({ error: 'Parámetros inválidos' });
  }
  try {
    const response = await axios.post(`${BLOCKCHAIN_API}/p2p/orders`, { address, type, amount, price });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Error creando orden P2P', details: err.message });
  }
});

// Obtener recompensa real de la última sesión de minería
router.get('/mining/reward', (req, res) => {
  const { address } = req.query;
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Dirección inválida' });
  }
  // Si la blockchain expone la recompensa, hacer proxy aquí. Si no, simular:
  const session = miningSessions[address];
  if (!session) return res.status(404).json({ error: 'No hay sesión registrada' });
  // Simulación: recompensa proporcional al tiempo minado (puedes cambiar por lógica real)
  const now = Date.now();
  const elapsed = Math.min(now - session.start, 24*60*60*1000);
  const reward = +(5 + (elapsed / (24*60*60*1000)) * 15).toFixed(2); // 5-20 RSC por sesión
  res.json({ reward, start: session.start, end: session.start + 24*60*60*1000 });
});

module.exports = router; 