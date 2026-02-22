import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  GenerationTarget,
  ComponentType,
  StackLiveTargetConfig,
} from "@/lib/stacklive-generation-target";
import {
  getTargetLabel,
  getComponentTypeLabel,
  DEFAULT_STACKLIVE_CONFIG,
} from "@/lib/stacklive-generation-target";

interface StackLiveTargetSelectorProps {
  config: StackLiveTargetConfig | null | undefined;
  onChange: (config: StackLiveTargetConfig) => void;
}

/**
 * StackLive Target Selector Component
 *
 * Allows users to configure the StackLive generation target, including:
 * - Target output format (legacy embed, runtime embed, creator manifest)
 * - Component type (primitive, system, experience)
 * - Whether the component has variants
 */
export function StackLiveTargetSelector({
  config,
  onChange,
}: StackLiveTargetSelectorProps) {
  const currentConfig = config || DEFAULT_STACKLIVE_CONFIG;

  const handleTargetChange = (target: GenerationTarget) => {
    onChange({
      ...currentConfig,
      target,
    });
  };

  const handleComponentTypeChange = (componentType: ComponentType) => {
    onChange({
      ...currentConfig,
      componentType,
    });
  };

  const handleVariantsChange = (hasVariants: boolean) => {
    onChange({
      ...currentConfig,
      hasVariants,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="stacklive-target">Generation Target</Label>
        <Select
          value={currentConfig.target}
          onValueChange={(value) =>
            handleTargetChange(value as GenerationTarget)
          }
        >
          <SelectTrigger id="stacklive-target">
            <SelectValue placeholder="Select generation target" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stacklive-legacy-embed">
              {getTargetLabel("stacklive-legacy-embed")}
            </SelectItem>
            <SelectItem value="stacklive-runtime-embed">
              {getTargetLabel("stacklive-runtime-embed")}
            </SelectItem>
            <SelectItem value="stacklive-creator-manifest">
              {getTargetLabel("stacklive-creator-manifest")}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose the output format for StackLive components
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="component-type">Component Type</Label>
        <Select
          value={currentConfig.componentType}
          onValueChange={(value) =>
            handleComponentTypeChange(value as ComponentType)
          }
        >
          <SelectTrigger id="component-type">
            <SelectValue placeholder="Select component type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primitive">
              {getComponentTypeLabel("primitive")}
            </SelectItem>
            <SelectItem value="system">
              {getComponentTypeLabel("system")}
            </SelectItem>
            <SelectItem value="experience">
              {getComponentTypeLabel("experience")}
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Categorize the component being generated
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="has-variants"
          checked={currentConfig.hasVariants}
          onCheckedChange={handleVariantsChange}
        />
        <Label htmlFor="has-variants" className="cursor-pointer">
          Component has variants
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Enable variant schema generation for this component
      </p>
    </div>
  );
}
