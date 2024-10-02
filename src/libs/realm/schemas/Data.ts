import {Realm} from '@realm/react';
import {time} from 'console';

export class Data extends Realm.Object<Data> {
  _id!: string;
  user_id!: string;
  power!: number;
  temperature1!: number;
  temperature2!: number;
  voltage!: number;
  created_at!: string;
  time_stamp!: Date;

  static generate(
    user_id: string,
    power: number,
    temperature1: number,
    temperature2: number,
    voltage: number,
  ) {
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return {
      _id: new Realm.BSON.UUID(),
      user_id: user_id,
      power: power,
      temperature1: temperature1,
      temperature2: temperature2,
      voltage: voltage,
      created_at: formattedDate,
      time_stamp: date,
    };
  }

  static schema = {
    name: 'Data',
    primaryKey: '_id',
    properties: {
      _id: 'uuid',
      user_id: {
        type: 'string',
        indexed: true,
      },
      power: 'int',
      temperature1: 'float',
      temperature2: 'float',
      voltage: 'float',
      created_at: 'string',
      time_stamp: 'date',
    },
  };
}
