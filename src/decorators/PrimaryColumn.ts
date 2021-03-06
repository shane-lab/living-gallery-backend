import { PrimaryGeneratedColumn } from 'typeorm';

export const EnvironmentPrimaryColumn = (mappings?: {any}, type?: string) => {
    const env = type || process.env.NODE_ENV || 'development';

    const defaults = Object.assign({ name: 'id'}, mappings || {}); 

    return env === 'development' ? PrimaryGeneratedColumn(defaults) : PrimaryGeneratedColumn('uuid', defaults);
}