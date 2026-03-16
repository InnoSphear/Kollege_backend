import mongoose from 'mongoose';

const crmAutomationRuleSchema = new mongoose.Schema(
  {
    counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true },
    triggerType: { type: String, required: true },
    triggerConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    actionType: { type: String, required: true },
    actionConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true, index: true },
    isGlobal: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

crmAutomationRuleSchema.index({ counselorId: 1, isActive: 1 });

export default mongoose.model('CrmAutomationRule', crmAutomationRuleSchema);
