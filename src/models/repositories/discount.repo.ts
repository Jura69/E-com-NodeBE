import { getSelectData, unGetSelectData } from '../../utils';
import { Model } from 'mongoose';

interface FindAllParams {
  limit?: number;
  page?: number;
  sort?: string;
  filter: any;
  select?: string[];
  unSelect?: string[];
  model: Model<any>;
}

export const findAllDiscountCodesUnSelect = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  unSelect,
  model,
}: FindAllParams): Promise<any[]> => {
  const skip = (page - 1) * limit;
  const sortBy: any = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(unGetSelectData(unSelect || []))
    .lean();
  return documents;
};

export const findAllDiscountCodesSelect = async ({
  limit = 50,
  page = 1,
  sort = 'ctime',
  filter,
  select,
  model,
}: FindAllParams): Promise<any[]> => {
  const skip = (page - 1) * limit;
  const sortBy: any = sort === 'ctime' ? { _id: -1 } : { _id: 1 };
  const documents = await model
    .find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select || []))
    .lean();
  return documents;
};

export const checkDiscountExists = async ({
  model,
  filter,
}: {
  model: Model<any>;
  filter: any;
}): Promise<any> => {
  return await model.findOne(filter).lean();
};

