import User from '../models/user.model.js';
import { ROLES } from '../constants/roles.js';

export const ensureDefaultAdmin = async () => {
  const adminPhone = '6203818011';
  const adminPassword = 'Admin@321';

  const exists = await User.findOne({ phone: adminPhone, role: ROLES.PLATFORM_ADMIN });
  if (exists) return;

  await User.create({
    name: 'Platform Admin',
    email: 'admin@kollege.local',
    phone: adminPhone,
    password: adminPassword,
    role: ROLES.PLATFORM_ADMIN,
  });

  console.log('Default admin created: id 6203818011 / password Admin@321');
};
