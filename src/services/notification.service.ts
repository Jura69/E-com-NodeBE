import Notification, { INotification } from '../models/notification.model';

interface PushNotiParams {
  type?: string;
  receivedId?: number;
  senderId?: number | string;
  options?: Record<string, any>;
}

interface ListNotiParams {
  userId?: number;
  type?: string;
  isRead?: number;
}

export const pushNotiToSystem = async ({
  type = 'SHOP-001',
  receivedId = 1,
  senderId = 1,
  options = {},
}: PushNotiParams): Promise<INotification> => {
  let noti_content: string;

  if (type === 'SHOP-001') {
    noti_content = `@@@ vừa mới thêm một sản phẩm: @@@@`;
  } else if (type === 'PROMOTION-001') {
    noti_content = `@@@ vừa mới thêm một voucher: cecca`;
  } else {
    noti_content = '';
  }

  const newNoti = await Notification.create({
    noti_type: type as any,
    noti_content,
    noti_senderId: senderId as any,
    noti_receivedId: receivedId,
    noti_options: options,
  });

  return newNoti;
};

export const listNotiByUser = async ({
  userId = 1,
  type = 'ALL',
}: ListNotiParams): Promise<any[]> => {
  const match: any = { noti_receivedId: userId };

  if (type !== 'ALL') {
    match['noti_type'] = type;
  }

  return await Notification.aggregate([
    {
      $match: match,
    },
    {
      $project: {
        noti_type: 1,
        noti_senderId: 1,
        noti_receivedId: 1,
        noti_content: {
          $concat: [
            {
              $substr: ['$noti_options.shope_name', 0, -1],
            },
            ' vừa mới thêm một sản phẩm mới: ',
            {
              $substr: ['$noti_options.product_name', 0, -1],
            },
          ],
        },
        createAt: 1,
        noti_options: 1,
      },
    },
  ]);
};

