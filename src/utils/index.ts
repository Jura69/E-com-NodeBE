import _ from 'lodash';
import { Types } from 'mongoose';

export const convertToObjectIdMongodb = (id: string): Types.ObjectId => {
  return new Types.ObjectId(id);
};

export const getIntoData = <T extends Record<string, any>>({
  fields = [],
  object = {} as T,
}: {
  fields: string[];
  object?: T;
}): Partial<T> => {
  return _.pick(object, fields) as Partial<T>;
};

export const getSelectData = (select: string[] = []): Record<string, 1> => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

export const unGetSelectData = (select: string[] = []): Record<string, 0> => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

export const removeUndefinedObject = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  const result = { ...obj };
  Object.keys(result).forEach((k) => {
    if (result[k] == undefined || result[k] == null) {
      delete result[k];
    }
  });
  return result;
};

export const updateNestedObjectParser = (
  obj: Record<string, any>
): Record<string, any> => {
  const final: Record<string, any> = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });

  return final;
};

export const cleanAndFlattenObject = (
  obj: Record<string, any>
): Record<string, any> => {
  const final: Record<string, any> = {};

  Object.keys(obj).forEach((k) => {
    const value = obj[k];

    if (value == undefined || value == null) {
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const response = cleanAndFlattenObject(value);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = value;
    }
  });

  return final;
};

