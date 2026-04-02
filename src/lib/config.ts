import configRaw from '../../site.config.yaml?raw';
import yaml from 'js-yaml';

const config = yaml.load(configRaw) as Record<string, any>;

export default config;
