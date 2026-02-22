import type { StackLiveTargetConfig } from "../../src/lib/stacklive-generation-target";

export interface DyadComponent {
  name: string;
  description?: string;
  props?: Array<{
    name: string;
    type?: string;
    default?: any;
  }>;
}

export interface DyadOutput {
  components: DyadComponent[];
}

export interface GenerateEmbedsOptions {
  dyad: DyadOutput;
  outDir: string;
  /**
   * Optional StackLive target configuration.
   * If not provided, generates all formats (legacy + runtime).
   */
  targetConfig?: StackLiveTargetConfig;
}

export interface ComponentNames {
  kebab: string;
  pascal: string;
  snake: string;
}

export interface MappedProp {
  name: string;
  type: string;
  default?: any;
}
