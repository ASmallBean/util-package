/**
 * @method DeepClone
 * @description 描述：深度克隆对象
 * @param {any} obj 需要克隆的对象
 * @return {any}
 * @author Leo Jun 11, 2019 22:12
 */
import { Moment } from 'moment';

const qs = require('qs');

export const DeepClone = (target: any): any => {
  if (target == null || typeof target !== 'object') {
    return target;
  }
  if (target instanceof Date) {
    const copy = new Date();
    copy.setTime(target.getTime());
    return copy;
  }
  if (target instanceof Array) {
    const copy = [];
    const len = target.length;
    for (let i = 0; i < len; ++i) {
      copy[i] = DeepClone(target[i]);
    }
    return copy;
  }
  if (target instanceof Object) {
    const copy: any = {};
    Object.keys(target).forEach(attr => {
      if (target.hasOwnProperty(attr)) {
        copy[attr] = DeepClone(target[attr]);
      }
    });
    return copy;
  }
  throw new Error('无法拷贝该对象,该对象不在支持拷贝范围内');
};

/**
 * @method getBeginTimestamp
 * @description 描述：获取当天0点的时间戳
 * @param {Date} date
 * @return return {number} 返回时间戳(秒级)
 * @author Leo Jun 11, 2019 21:42
 */
export const getBeginTimestampOfDay = (date: Date): number =>
  new Date(date.toDateString()).getTime() / 1000;

/**
 * @method getEndTimestamp
 * @description 描述：获取当天24点的时间戳
 * @param {Date} date
 * @return return {number} 返回时间戳(秒级)
 * @author Leo Jun 11, 2019 21:42
 */
export const getEndTimestampOfDay = (date: Date): number =>
  new Date(`${date.toDateString()} 23:59:59`).getTime() / 1000;

/**
 * @method getQueryRangeDate
 * @description 获取查询日期的时间区间
 * @param {Moment[]} dates
 * @return string[]
 * @author Leo Sep 20, 2019 10:56
 */
export const getQueryRangeDate = (dates: Moment[]) => [
  getBeginTimestampOfDay(new Date(dates[0].unix() * 1000)),
  getEndTimestampOfDay(new Date(dates[1].unix() * 1000)),
];

/**
 * 解析时间
 * @param time
 * @param format
 */
export function parseTime(
  time: Date | number | string,
  format: string = '{y}-{m}-{d} {h}:{i}:{s}',
) {
  if (arguments.length === 0) {
    return null;
  }
  let date;
  if (time instanceof Date) {
    date = time;
  } else {
    if (String(time).length === 10) {
      time = +time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  return format.replace(/{([ymdhisa])+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = `0${value}`;
    }
    return value || 0;
  });
}

/**
 * 时间戳细致化
 * @param time
 */
export function formatTime(time: number | string) {
  // 时间戳转毫秒
  if (String(time).length === 10) {
    time = +time * 1000;
  }
  // 获取传的时间Date类型
  const date = new Date(time);
  // 获取传的时间的年月日
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
  };
  // 当前时间日期对象
  const curDate = new Date();
  // 获取当前时间的年月日
  const curDateObj = {
    y: curDate.getFullYear(),
    m: curDate.getMonth() + 1,
    d: curDate.getDate(),
  };
  // 时间戳过滤
  if (curDateObj.y === formatObj.y && curDateObj.m === formatObj.m) {
    if (curDateObj.d === formatObj.d) {
      return `今天 ${parseTime(time, '{h}:{i}:{s}')}`;
    }
    if (curDateObj.d === formatObj.d + 1) {
      return `昨天 ${parseTime(time, '{h}:{i}:{s}')}`;
    }
    if (curDateObj.d === formatObj.d + 2) {
      return `前天 ${parseTime(time, '{h}:{i}:{s}')}`;
    }
  }
  return parseTime(time, '{y}-{m}-{d} {h}:{i}:{s}');
}

/**
 * 比较两个日期大小
 * @param date1
 * @param date2
 */
export function compareDate(date1: number | string, date2: number | string) {
  const oDate1 = new Date(date1).getTime();
  const oDate2 = new Date(date2).getTime();
  return oDate1 > oDate2;
}

/**
 * 金额默认加2位小数，且加上千分位
 * @param num
 */
export function formatMoney(num: string | number) {
  return Number(num)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

/**
 * @method compare
 * @description 描述：将数组按由小到大的顺序排序
 * @example 此函数作为参数传入数组的sort方法  例:[1,3,4].sort(compare)
 * @author Leo
 * 2019/04/28
 */
export const compare = (val1: string | number, val2: string | number) => {
  val1 = Number(val1);
  val2 = Number(val2);
  if (val1 > val2) {
    return 1;
  }
  if (val1 < val2) {
    return -1;
  }
  return 0;
};

/**
 * @method loadScript
 * @description 描述：加载script
 * @param {String} url:script文件地址
 * @param {String} windowObjName:加载完毕后挂载到的对象名称
 * @return Function
 * @example
 * @author Leo May 14, 2019 11:20
 */
const loadScript = (url: string, ObjName: string) => () =>
  new Promise((resolve, reject) => {
    if (typeof window[ObjName] !== 'undefined') {
      resolve(window[ObjName]);
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.onerror = () => {
      reject(window[ObjName]);
    };

    if (url.includes('callback')) {
      const callbackName = qs.pares(url).callback;
      script.src = url;
      // @ts-ignore
      window[callbackName] = () => {
        resolve(window[ObjName]);
      };
    } else {
      script.src = url;
      script.onload = () => {
        resolve(window[ObjName]);
      };
    }
    document.head.appendChild(script);
  });

/**
 * @method loadBMap
 * @description 描述：异步加载百度地图
 */
export const loadBMap = loadScript(
  'http://api.map.baidu.com/api?v=2.0&ak=c8gUsgsM3H7VPOCOZKDl8NEIWkki0wGt&callback=onloadBdMap',
  'BMap',
);
