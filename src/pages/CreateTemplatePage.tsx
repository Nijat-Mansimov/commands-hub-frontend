import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Terminal, Eye, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useFilterOptions, useTemplate } from '@/hooks/useTemplates';
import { templatesService } from '@/services/templates';
import { toast } from '@/hooks/use-toast';

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Use alphanumeric and underscores only'),
  type: z.enum(['text', 'password', 'number', 'email', 'url', 'ip', 'port', 'domain', 'select', 'textarea']),
  description: z.string().optional(),
  required: z.boolean().default(true),
  options: z.string().optional(),
});

const variantSchema = z.object({
  name: z.string().min(1, 'Variant name required'),
  commandTemplate: z.string().min(1, 'Command template required'),
});

const schema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 chars').max(100),
  description: z.string().min(10, 'Description must be at least 10 chars').max(500),
  longDescription: z.string().optional(),
  tags: z.string().optional(),
  module: z.string().min(1, 'Module is required'),
  subcategory: z.string().min(1, 'Subcategory is required'),
  tool: z.string().min(1, 'Tool is required'),
  targetSystem: z.string().min(1, 'Target system is required'),
  attackProtocol: z.string().optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  commandTemplate: z.string().min(1, 'Command template is required'),
  requiredFields: z.array(fieldSchema),
  variants: z.array(variantSchema).optional(),
  isPrivate: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface CreateTemplatePageProps {
  mode?: 'create' | 'edit';
}

const CreateTemplatePage = ({ mode = 'create' }: CreateTemplatePageProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: filterOptions } = useFilterOptions();
  const { data: existingData } = useTemplate(mode === 'edit' ? id! : '');
  const options = filterOptions?.data;
  const [selectedModule, setSelectedModule] = useState('');
  const [previewCommand, setPreviewCommand] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      difficulty: 'Intermediate',
      requiredFields: [{ name: '', type: 'text', description: '', required: true }],
      variants: [],
    },
  });

  const { fields: fieldDefs, append: addField, remove: removeField } = useFieldArray({ control, name: 'requiredFields' });
  const { fields: variantDefs, append: addVariant, remove: removeVariant } = useFieldArray({ control, name: 'variants' });

  const commandTemplate = watch('commandTemplate');
  const requiredFields = watch('requiredFields');

  // Populate form in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingData?.data) {
      const t = existingData.data;
      const parts = t.category?.split(' - ');
      const mod = parts?.[0] || '';
      const sub = parts?.[1] || '';
      setSelectedModule(mod);
      reset({
        name: t.name,
        description: t.description,
        longDescription: t.longDescription || '',
        tags: t.tags?.join(', ') || '',
        module: mod,
        subcategory: sub,
        tool: t.tool,
        targetSystem: t.targetSystem,
        attackProtocol: t.attackProtocol || '',
        difficulty: t.difficulty,
        commandTemplate: t.commandTemplate,
        requiredFields: t.requiredFields.map(f => ({
          name: f.fieldName,
          type: f.fieldType,
          description: f.description,
          required: f.required,
          options: f.options?.join(', ') || '',
        })),
        variants: t.variants || [],
      });
    }
  }, [existingData, mode, reset]);

  // Validate placeholders match fields
  useEffect(() => {
    if (!commandTemplate) return;
    
    const placeholders = [...commandTemplate.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]);
    
    // Get field names from the current form values (most reliable)
    const fieldNames = requiredFields
      .filter(f => f.name) // Only include non-empty field names
      .map(f => f.name.trim().toLowerCase()) // Normalize: trim and lowercase
      .filter(Boolean);
    
    // Check placeholders against field names (case-insensitive for matching)
    const missing = placeholders.filter(p => 
      !fieldNames.includes(p.toLowerCase())
    );
    
    setMissingFields(missing);
  }, [commandTemplate, requiredFields]);

  const handlePreview = () => {
    let cmd = commandTemplate || '';
    requiredFields.forEach(field => {
      const fieldName = field.name?.trim();
      if (fieldName) {
        cmd = cmd.replace(new RegExp(`\\{\\{${fieldName}\\}\\}`, 'g'), `[${fieldName}]`);
      }
    });
    setPreviewCommand(cmd);
  };

  const onSubmit = async (data: FormData) => {
    // Backend will validate placeholder matching, so we don't need frontend validation
    const payload = {
      ...data,
      category: `${data.module} - ${data.subcategory}`,
      subcategory: data.subcategory,
      tags: data.tags?.split(',').map(t => t.trim()).filter(Boolean) || [],
      requiredFields: data.requiredFields.map(f => ({
        fieldName: f.name?.trim()!,
        fieldType: f.type!,
        description: f.description,
        required: f.required ?? true,
        options: f.type === 'select' && f.options ? f.options.split(',').map(o => o.trim()) : undefined,
      })),
    } as Partial<import('@/types/template').Template>;

    try {
      if (mode === 'edit' && id) {
        await templatesService.update(id, payload);
        toast({ title: 'Template updated!' });
        navigate(`/templates/${id}`);
      } else {
        const resp = await templatesService.create(payload);
        toast({ title: 'Template created!', description: 'Your template has been published.' });
        navigate(`/templates/${resp.data._id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save template.',
        variant: 'destructive',
      });
    }
  };

  const modules = Object.keys(options?.categoriesHierarchy || {});
  const subcategories = selectedModule ? (options?.categoriesHierarchy || {})[selectedModule] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-mono">
            <span className="text-gradient-primary">{mode === 'edit' ? 'Edit' : 'Create'}</span> Template
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {mode === 'edit' ? 'Update your attack payload template.' : 'Share a new attack command payload with the community.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-muted-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-mono text-muted-foreground">Template Name *</Label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Kerberoasting with Impacket"
                  className={`mt-1.5 bg-muted/50 border-border font-mono text-sm ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Description * (10-500 chars)</Label>
                <Textarea
                  {...register('description')}
                  placeholder="Brief description of what this payload does..."
                  className={`mt-1.5 bg-muted/50 border-border font-mono text-sm resize-none ${errors.description ? 'border-destructive' : ''}`}
                  rows={2}
                />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Long Description (optional)</Label>
                <Textarea
                  {...register('longDescription')}
                  placeholder="Detailed explanation, prerequisites, use cases..."
                  className="mt-1.5 bg-muted/50 border-border font-mono text-sm resize-none"
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Tags (comma-separated)</Label>
                <Input
                  {...register('tags')}
                  placeholder="kerberos, active-directory, credential-theft"
                  className="mt-1.5 bg-muted/50 border-border font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categorization */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-muted-foreground">Categorization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-mono text-muted-foreground">Module *</Label>
                <Select
                  value={selectedModule}
                  onValueChange={(v) => { setSelectedModule(v); setValue('module', v); setValue('subcategory', ''); }}
                >
                  <SelectTrigger className={`mt-1.5 bg-muted/50 border-border text-sm ${errors.module ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-64">
                    {modules.map(m => (
                      <SelectItem key={m} value={m} className="font-mono text-sm">{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.module && <p className="text-xs text-destructive mt-1">{errors.module.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Subcategory *</Label>
                <Select
                  value={watch('subcategory') || ''}
                  onValueChange={(v) => setValue('subcategory', v)}
                  disabled={!selectedModule}
                >
                  <SelectTrigger className={`mt-1.5 bg-muted/50 border-border text-sm ${errors.subcategory ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-64">
                    {subcategories.map(s => (
                      <SelectItem key={s} value={s} className="font-mono text-sm">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subcategory && <p className="text-xs text-destructive mt-1">{errors.subcategory.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Tool *</Label>
                <Input
                  {...register('tool')}
                  placeholder="impacket, nmap, sqlmap..."
                  className={`mt-1.5 bg-muted/50 border-border font-mono text-sm ${errors.tool ? 'border-destructive' : ''}`}
                />
                {errors.tool && <p className="text-xs text-destructive mt-1">{errors.tool.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Target System *</Label>
                <Select value={watch('targetSystem') || ''} onValueChange={(v) => setValue('targetSystem', v)}>
                  <SelectTrigger className={`mt-1.5 bg-muted/50 border-border text-sm ${errors.targetSystem ? 'border-destructive' : ''}`}>
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {['Linux', 'Windows', 'Active Directory', 'Web Application', 'Network', 'Cloud', 'Cross-Platform', 'Mobile'].map(t => (
                      <SelectItem key={t} value={t} className="font-mono text-sm">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.targetSystem && <p className="text-xs text-destructive mt-1">{errors.targetSystem.message}</p>}
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Attack Protocol</Label>
                <Input
                  {...register('attackProtocol')}
                  placeholder="Kerberos, NTLM, HTTP..."
                  className="mt-1.5 bg-muted/50 border-border font-mono text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-mono text-muted-foreground">Difficulty *</Label>
                <Select value={watch('difficulty') || 'Intermediate'} onValueChange={(v: any) => setValue('difficulty', v)}>
                  <SelectTrigger className="mt-1.5 bg-muted/50 border-border text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(d => (
                      <SelectItem key={d} value={d} className="font-mono text-sm">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <Label className="text-xs font-mono text-muted-foreground">Privacy Settings</Label>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {watch('isPrivate') ? 'Only you can see this template' : 'Visible to all users'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{watch('isPrivate') ? 'Private' : 'Public'}</span>
                  <Switch checked={watch('isPrivate') || false} onCheckedChange={(v) => setValue('isPrivate', v)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Command Configuration */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                Command Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-mono text-muted-foreground">Command Template *</Label>
                <p className="text-xs text-muted-foreground/60 mt-0.5 mb-1.5">
                  Use <code className="text-primary font-mono bg-primary/10 px-1 rounded">{'{{fieldName}}'}</code> for dynamic placeholders
                </p>
                <Textarea
                  {...register('commandTemplate')}
                  placeholder="GetUserSPNs.py -request -dc-ip {{dcip}} {{domain}}/{{username}}:{{password}}"
                  className={`bg-muted/50 border-border font-mono text-sm resize-none ${errors.commandTemplate ? 'border-destructive' : ''}`}
                  rows={3}
                />
                {errors.commandTemplate && <p className="text-xs text-destructive mt-1">{errors.commandTemplate.message}</p>}

                {missingFields.length > 0 && (
                  <div className="flex items-start gap-2 mt-2 p-2 bg-warning/10 border border-warning/30 rounded text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                    <span className="text-warning font-mono">
                      Undefined placeholders: {missingFields.join(', ')} — add corresponding fields below
                    </span>
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewCommand && (
                <div className="terminal-block rounded p-3 text-xs font-mono text-terminal">
                  <span className="text-muted-foreground/50">$ </span>{previewCommand}
                </div>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handlePreview} className="border-border font-mono">
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview Command
              </Button>
            </CardContent>
          </Card>

          {/* Field Definitions */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono text-muted-foreground">Input Fields</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addField({ name: '', type: 'text', description: '', required: true })}
                  className="border-border hover:border-primary/50 font-mono text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldDefs.map((field, index) => (
                <div key={field.id} className="border border-border rounded-lg p-3 space-y-3 bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-mono text-muted-foreground">Field Name *</Label>
                      <Input
                        {...register(`requiredFields.${index}.name`)}
                        placeholder="fieldname"
                        className={`mt-1 bg-muted/50 border-border font-mono text-sm h-8 ${errors.requiredFields?.[index]?.name ? 'border-destructive' : ''}`}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-mono text-muted-foreground">Type *</Label>
                      <Select
                        value={watch(`requiredFields.${index}.type`) || 'text'}
                        onValueChange={(v: any) => setValue(`requiredFields.${index}.type`, v)}
                      >
                        <SelectTrigger className="mt-1 bg-muted/50 border-border text-xs h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {['text', 'password', 'number', 'email', 'url', 'ip', 'port', 'domain', 'select', 'textarea'].map(t => (
                            <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-mono text-muted-foreground">Description / Helper Text</Label>
                    <Input
                      {...register(`requiredFields.${index}.description`)}
                      placeholder="Domain Controller IP address"
                      className="mt-1 bg-muted/50 border-border font-mono text-xs h-8"
                    />
                  </div>

                  {watch(`requiredFields.${index}.type`) === 'select' && (
                    <div>
                      <Label className="text-xs font-mono text-muted-foreground">Options (comma-separated)</Label>
                      <Input
                        {...register(`requiredFields.${index}.options`)}
                        placeholder="option1, option2, option3"
                        className="mt-1 bg-muted/50 border-border font-mono text-xs h-8"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={watch(`requiredFields.${index}.required`) ?? true}
                        onCheckedChange={(v) => setValue(`requiredFields.${index}.required`, v)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Label className="text-xs font-mono text-muted-foreground">Required field</Label>
                    </div>
                    {fieldDefs.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeField(index)}
                        className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Variants */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono text-muted-foreground">Command Variants (optional)</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addVariant({ name: `Variant ${variantDefs.length + 1}`, commandTemplate: '' })}
                  className="border-border hover:border-primary/50 font-mono text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
                </Button>
              </div>
            </CardHeader>
            {variantDefs.length > 0 && (
              <CardContent className="space-y-3">
                {variantDefs.map((variant, index) => (
                  <div key={variant.id} className="border border-border rounded-lg p-3 space-y-2 bg-muted/20">
                    <div className="flex gap-2">
                      <Input
                        {...register(`variants.${index}.name`)}
                        placeholder="Variant name"
                        className="bg-muted/50 border-border font-mono text-sm h-8 flex-shrink-0 w-40"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeVariant(index)}
                        className="h-8 px-2 text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      {...register(`variants.${index}.commandTemplate`)}
                      placeholder="Command template with {{placeholders}}"
                      className="bg-muted/50 border-border font-mono text-sm resize-none"
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3 pb-8">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="border-border font-mono">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono px-8"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {mode === 'edit' ? 'Update Template' : 'Publish Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTemplatePage;
