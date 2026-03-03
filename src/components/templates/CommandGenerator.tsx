import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Terminal, Copy, Download, Loader2, RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Template, RequiredField } from '@/types/template';
import { templatesService } from '@/services/templates';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface CommandGeneratorProps {
  template: Template;
}

const buildSchema = (fields: RequiredField[]) => {
  const shape: Record<string, z.ZodTypeAny> = {};
  fields.forEach(field => {
    let schema: z.ZodString;
    if (field.fieldType === 'email') schema = z.string().email('Invalid email');
    else if (field.fieldType === 'url') schema = z.string().url('Invalid URL');
    else if (field.fieldType === 'number') schema = z.string().regex(/^\d+$/, 'Must be a number');
    else if (field.fieldType === 'port') schema = z.string().regex(/^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/, 'Invalid port (1-65535)');
    else if (field.fieldType === 'ip') schema = z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-fA-F:]+)$/, 'Invalid IP address');
    else if (field.fieldType === 'domain') schema = z.string().regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid domain');
    else schema = z.string();

    if (field.required) {
      shape[field.fieldName] = schema.min(1, `${field.fieldName} is required`);
    } else {
      shape[field.fieldName] = schema.optional().or(z.literal(''));
    }
  });
  return z.object(shape);
};

const CommandGenerator: React.FC<CommandGeneratorProps> = ({ template }) => {
  const [generatedCommand, setGeneratedCommand] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeVariant, setActiveVariant] = useState<number>(-1); // -1 = main template

  const fields = template.requiredFields || [];
  const schema = useMemo(() => buildSchema(fields), [fields]);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: useMemo(() => {
      const defaults: Record<string, string> = {};
      fields.forEach(field => {
        defaults[field.fieldName] = '';
      });
      return defaults;
    }, [fields]),
  });

  // Reinitialize form when fields change
  useEffect(() => {
    const defaultValues: Record<string, string> = {};
    fields.forEach(field => {
      defaultValues[field.fieldName] = '';
    });
    reset(defaultValues);
  }, [fields, reset]);

  const getCurrentTemplate = () => {
    if (activeVariant >= 0 && template.variants?.[activeVariant]) {
      return template.variants[activeVariant].commandTemplate;
    }
    return template.commandTemplate;
  };

  const generateLocally = (values: Record<string, string>) => {
    let cmd = getCurrentTemplate();
    Object.entries(values).forEach(([key, value]) => {
      cmd = cmd.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || `{{${key}}}`);
    });
    return cmd;
  };

  const onSubmit = async (values: Record<string, string>) => {
    setIsGenerating(true);
    try {
      try {
        const resp = await templatesService.generate(template._id, values);
        if (resp.success && resp.data?.command) {
          setGeneratedCommand(resp.data.command);
          return;
        }
      } catch {
        // Fallback to local generation
      }
      const localCmd = generateLocally(values);
      setGeneratedCommand(localCmd);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copied!', description: 'Command copied to clipboard.' });
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCommand], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderField = (field: RequiredField) => {
    const fieldError = errors[field.fieldName]?.message as string | undefined;

    if (field.fieldType === 'select' && field.options?.length) {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground">
            {field.fieldName}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select onValueChange={(v) => setValue(field.fieldName, v)}>
            <SelectTrigger className="bg-muted/50 border-border font-mono text-sm h-9">
              <SelectValue placeholder={field.description || `Select ${field.fieldName}`} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt} className="font-mono">{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
        </div>
      );
    }

    if (field.fieldType === 'textarea') {
      return (
        <div className="space-y-1.5">
          <Label className="text-xs font-mono text-muted-foreground">
            {field.fieldName}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            {...register(field.fieldName)}
            placeholder={field.description || field.fieldName}
            className="bg-muted/50 border-border font-mono text-sm resize-none"
            rows={3}
          />
          {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-mono text-muted-foreground">
          {field.fieldName}
          {field.required && <span className="text-destructive ml-1">*</span>}
          <span className="ml-2 text-muted-foreground/50">({field.fieldType})</span>
        </Label>
        <Input
          {...register(field.fieldName)}
          type={field.fieldType === 'password' ? 'password' : 'text'}
          placeholder={field.description || field.placeholder || field.fieldName}
          className={`bg-muted/50 border-border font-mono text-sm h-9 ${fieldError ? 'border-destructive' : ''}`}
        />
        {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
      </div>
    );
  };

  return (
    <Card className="bg-card border-border sticky top-20">
      <CardHeader className="pb-3 border-b border-border">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          Command Generator
          <Badge className="bg-primary/20 text-primary border-primary/30 text-xs ml-auto">
            {fields.length} fields
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Variant selector */}
        {template.variants && template.variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setActiveVariant(-1)}
              className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${activeVariant === -1 ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
            >
              Main
            </button>
            {template.variants.map((v, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveVariant(i)}
                className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${activeVariant === i ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}

        {/* Command template preview */}
        <div className="terminal-block rounded p-3 text-xs font-mono text-muted-foreground overflow-x-auto">
          <span className="text-muted-foreground/50 select-none">$ </span>
          {getCurrentTemplate()}
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-3">
          {fields.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No input fields required.</p>
          ) : (
            fields.map((field) => (
              <div key={field.fieldName} className="w-full">
                {renderField(field)}
              </div>
            ))
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isGenerating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-sm h-9"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Zap className="h-4 w-4 mr-1.5" />
              )}
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => { reset(); setGeneratedCommand(''); }}
              className="border-border hover:border-primary/50 h-9 w-9"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Generated command output */}
        {generatedCommand && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-terminal">✓ Generated Command</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:text-primary"
                  onClick={handleCopy}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs hover:text-primary"
                  onClick={handleDownload}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </div>
            </div>
            <div className="terminal-block rounded p-3 text-xs font-mono text-terminal overflow-x-auto break-all">
              <span className="text-muted-foreground/50 select-none">$ </span>
              {generatedCommand}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommandGenerator;
