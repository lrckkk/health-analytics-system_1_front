export class IdToNameMapper {
    /**
     * 构造函数
     * @param {Object} idMap 一个键值对为 { id: name } 的映射对象。
     * 例如: { 1: '北京', 2: '上海', ... }
     */
    constructor(idMap) {
        if (typeof idMap !== 'object' || idMap === null) {
            throw new Error('IdToNameMapper: 构造函数需要一个有效的 idMap 对象。');
        }
        this.idMap = idMap;
    }

    /**
     * 将一个 ID 转换为对应的名称。
     * @param {number | string} id 要转换的 ID。
     * @returns {string | undefined} 对应的名称，如果未找到则返回 undefined。
     */
    getName(id) {
        return this.idMap[id];
    }

    /**
     * 递归地处理数据，将对象中特定字段的 ID 转换为名称。
     * 默认情况下，它会查找名为 'id' 的字段，并将其替换为 'name'。
     * 你可以通过 options 配置要查找的 ID 字段名和替换后的名称字段名。
     *
     * @param {any} data 要处理的原始数据 (可以是对象、数组或基本类型)。
     * @param {Object} [options] 配置选项。
     * @param {string} [options.idKey='id'] 原始数据中表示 ID 的字段名。
     * @param {string} [options.nameKey='name'] 转换后表示名称的字段名。
     * @param {boolean} [options.deleteOriginalId=true] 是否删除原始的 ID 字段。
     * @param {string | null} [options.unknownName='未知'] 如果找不到对应的名称，使用的默认名称。设置为 null 则保持 id 不变。
     * @returns {any} 转换后的数据副本。
     */
    mapData(data, options = {}) {
        const defaultOptions = {
            idKey: 'id',
            nameKey: 'name',
            deleteOriginalId: true,
            unknownName: '未知'
        };
        const opts = { ...defaultOptions, ...options };

        // 处理基本类型数据
        if (data === null || typeof data !== 'object') {
            return data;
        }

        // 处理数组
        if (Array.isArray(data)) {
            return data.map(item => this.mapData(item, opts));
        }

        // 处理对象
        const newData = { ...data }; // 创建一个浅拷贝以避免直接修改原数据

        if (newData.hasOwnProperty(opts.idKey)) {
            const idValue = newData[opts.idKey];
            const nameValue = this.getName(idValue);

            if (nameValue !== undefined) {
                newData[opts.nameKey] = nameValue;
            } else if (opts.unknownName !== null) {
                newData[opts.nameKey] = opts.unknownName;
                console.warn(`IdToNameMapper: 未找到 ID 为 "${idValue}" 的名称，使用默认值 "${opts.unknownName}"。`);
            } else {
                // 如果 unknownName 为 null，则保持原始 ID 字段不变
                console.warn(`IdToNameMapper: 未找到 ID 为 "${idValue}" 的名称，ID 字段保留。`);
            }

            if (opts.deleteOriginalId && newData.hasOwnProperty(opts.idKey) && opts.idKey !== opts.nameKey) {
                // 只有在 idKey 和 nameKey 不同时才删除，避免删除刚添加的 name
                delete newData[opts.idKey];
            }
        }

        // 递归处理对象中的其他属性
        for (const key in newData) {
            if (Object.prototype.hasOwnProperty.call(newData, key) && typeof newData[key] === 'object') {
                newData[key] = this.mapData(newData[key], opts);
            }
        }

        return newData;
    }
}