import shopModel, { IShop } from '../models/shop.model';

interface SelectFields {
  email?: number;
  password?: number;
  name?: number;
  status?: number;
  roles?: number;
}

export const findByEmail = async ({
  email,
  select = {
    email: 1,
    password: 2,
    name: 1,
    status: 1,
    roles: 1,
  },
}: {
  email: string;
  select?: SelectFields;
}): Promise<Partial<IShop> | null> => {
  return await shopModel.findOne({ email }).select(select as any).lean();
};

