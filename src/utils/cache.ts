import { merge, union, isEmpty } from "lodash";

export const cache = {
  get: function (path = '') {
    return new Promise<any>((resolve, reject) => {
      try {
        const data = localStorage.getItem(path) === 'undefined' || !localStorage.getItem(path) ?
          null : localStorage.getItem(path);

        resolve(JSON.parse(data ?? null) ?? {});
      } catch (error) {
        reject({ error });
      }
    })
  },
  set: function (path = '', data = {}) {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(path, JSON.stringify(data));
        resolve(data);
      } catch (error) {
        reject({ error });
      }
    });
  },

  add: async function (path = '', data = {}) {
    const _data = await this.get(path);
    const dataList = union<any>(_data, [data]);
    return this.set(path, dataList);
  },

  update: async function (path = '', data = {}) {
    data = merge(await this.get(path), data);
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(path, JSON.stringify(data));
        resolve(data);
      } catch (error) {
        reject({ error });
      }
    })
  },

  remove: function (path = '') {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(path);
        resolve(`${path} was removed`);
      } catch (error) {
        reject({ error });
      }
    })
  },

  clear: function () {
    return new Promise((resolve, reject) => {
      try {
        localStorage.clear();
        resolve(`Storage was cleared`);
      } catch (error) {
        reject({ error });
      }
    });
  },

  has: function (path) {
    return !isEmpty(localStorage.getItem(path));
  }
}