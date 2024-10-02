import {createRealmContext} from '@realm/react';
import {Data} from './schemas/Data';
import Realm from 'realm';

const realmAcessBehavior: Realm.OpenRealmBehaviorConfiguration = {
  type: Realm.OpenRealmBehaviorType.OpenImmediately,
};

export const syncConfig: any = {
  flexible: true,
  newRealmFileBehavior: realmAcessBehavior,
  existingRealmFileBehavior: realmAcessBehavior,
};

export const {
  RealmProvider, // Provider
  useRealm, // use instance
  useQuery, // searchs
  useObject, // a specific object
} = createRealmContext({schema: [Data]});
