import apikeyModel, { IApiKey } from '../models/apikey.model';

export const findById = async (key: string): Promise<IApiKey | null> => {
  const objKey = await apikeyModel.findOne({ key, status: true }).lean();
  return objKey;
};

