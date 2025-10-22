import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { createClient } from '@/utils/supabase/client';
import {
  Server,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Save,
  X,
  Key,
  Globe
} from 'lucide-react';

interface APIService {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  api_key: string | null;
  api_url: string | null;
  is_active: boolean;
  config: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function APIServicesTab() {
  const [services, setServices] = useState<APIService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<APIService | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    api_key: '',
    api_url: '',
    is_active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('api_services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Ошибка загрузки сервисов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingService(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      api_key: '',
      api_url: '',
      is_active: true
    });
  };

  const handleEdit = (service: APIService) => {
    setEditingService(service);
    setIsCreating(false);
    setFormData({
      name: service.name,
      display_name: service.display_name,
      description: service.description || '',
      api_key: service.api_key || '',
      api_url: service.api_url || '',
      is_active: service.is_active
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingService(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      api_key: '',
      api_url: '',
      is_active: true
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.display_name) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setIsSaving(true);
    try {
      const supabase = createClient();

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('api_services')
          .update({
            display_name: formData.display_name,
            description: formData.description || null,
            api_key: formData.api_key || null,
            api_url: formData.api_url || null,
            is_active: formData.is_active
          })
          .eq('id', editingService.id);

        if (error) throw error;
        toast.success('Сервис успешно обновлен!');
      } else {
        // Create new service
        const { error } = await supabase
          .from('api_services')
          .insert({
            name: formData.name,
            display_name: formData.display_name,
            description: formData.description || null,
            api_key: formData.api_key || null,
            api_url: formData.api_url || null,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success('Сервис успешно создан!');
      }

      handleCancel();
      loadServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(error.message || 'Ошибка сохранения сервиса');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (service: APIService) => {
    if (!confirm(`Удалить сервис "${service.display_name}"?`)) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('api_services')
        .delete()
        .eq('id', service.id);

      if (error) throw error;
      toast.success('Сервис успешно удален!');
      loadServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.error(error.message || 'Ошибка удаления сервиса');
    }
  };

  const handleToggleActive = async (service: APIService) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('api_services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      toast.success(`Сервис ${!service.is_active ? 'активирован' : 'деактивирован'}!`);
      loadServices();
    } catch (error: any) {
      console.error('Error toggling service:', error);
      toast.error(error.message || 'Ошибка изменения статуса');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Server className="w-6 h-6" />
            API Services
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Управление внешними API сервисами и интеграциями
          </p>
        </div>
        <Button onClick={handleCreate} disabled={isCreating || editingService !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить сервис
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingService) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingService ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingService ? 'Редактировать сервис' : 'Создать новый сервис'}
            </CardTitle>
            <CardDescription>
              {editingService ? 'Обновите данные API сервиса' : 'Добавьте новый API сервис'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Системное имя *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="openai"
                  disabled={!!editingService}
                />
                <p className="text-xs text-muted-foreground">
                  Уникальное имя (только латиница, без пробелов)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">Отображаемое имя *</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="OpenAI API"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание сервиса..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="api_url">API URL</Label>
                <Input
                  id="api_url"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  placeholder="https://api.example.com/v1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api_key">API Key</Label>
                <Input
                  id="api_key"
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Активен</Label>
                <p className="text-sm text-muted-foreground">
                  Включить использование этого сервиса
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
                <X className="w-4 h-4 mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохраняю...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Нет API сервисов</p>
            <p className="text-sm text-muted-foreground mt-1">
              Добавьте первый сервис для начала работы
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{service.display_name}</h3>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Активен
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Неактивен
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">{service.name}</Badge>
                    </div>
                    {service.description && (
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {service.api_url && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {service.api_url}
                        </div>
                      )}
                      {service.api_key && (
                        <div className="flex items-center gap-1">
                          <Key className="w-4 h-4" />
                          API Key настроен
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleToggleActive(service)}
                      variant="outline"
                      size="sm"
                    >
                      {service.is_active ? 'Деактивировать' : 'Активировать'}
                    </Button>
                    <Button
                      onClick={() => handleEdit(service)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(service)}
                      variant="outline"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

