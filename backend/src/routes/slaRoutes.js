/**
 * @openapi
 * /api/sla:
 *   get:
 *     summary: List all SLA policies
 *     description: Requires the admin role.
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: SLA policies returned
 *   post:
 *     summary: Create an SLA policy
 *     description: Requires the admin role.
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - responseHours
 *               - resolutionHours
 *             properties:
 *               name:
 *                 type: string
 *                 example: Standard Support
 *               responseHours:
 *                 type: number
 *                 example: 24
 *               resolutionHours:
 *                 type: number
 *                 example: 72
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: SLA policy created
 * /api/sla/{id}:
 *   patch:
 *     summary: Update an SLA policy
 *     description: Requires the admin role.
 *     tags: [SLA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: SLA policy ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Priority Support
 *               responseHours:
 *                 type: number
 *                 example: 12
 *               resolutionHours:
 *                 type: number
 *                 example: 48
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: SLA policy updated
 */
const express = require('express');
const SlaPolicy = require('../models/SlaPolicy');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/', async (req, res) => {
  try {
    const policies = await SlaPolicy.find().sort({ createdAt: -1 });
    return res.json({ policies });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch SLA policies', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, responseHours, resolutionHours, isDefault } = req.body;

    if (!name || !responseHours || !resolutionHours) {
      return res.status(400).json({ message: 'Name, responseHours and resolutionHours are required' });
    }

    if (isDefault) {
      await SlaPolicy.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }

    const policy = await SlaPolicy.create({
      name,
      responseHours,
      resolutionHours,
      isDefault: Boolean(isDefault),
    });

    return res.status(201).json({ policy });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create SLA policy', error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { name, responseHours, resolutionHours, isDefault } = req.body;
    const policy = await SlaPolicy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: 'SLA policy not found' });
    }

    if (name) policy.name = name;
    if (responseHours) policy.responseHours = Number(responseHours);
    if (resolutionHours) policy.resolutionHours = Number(resolutionHours);
    if (isDefault === true) {
      await SlaPolicy.updateMany(
        { _id: { $ne: policy._id }, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    if (isDefault !== undefined) policy.isDefault = Boolean(isDefault);

    await policy.save();
    return res.json({ policy });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update SLA policy', error: error.message });
  }
});

module.exports = router;
