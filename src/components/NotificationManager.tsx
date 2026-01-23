// components/NotificationManager.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Eye, Edit2, Power, Bell, Trash2, Plus } from 'lucide-react';
import { Save, Eye, Edit2, Power, Bell, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadNotifications, 
  saveNotifications, 
} from '@/utils/notificationStorage';
import type { AppNotification } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationManager() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AppNotification>>({
    title: '',
    message: '',
    isActive: false,
    showOncePerSession: true,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Carrega notificações ao iniciar
  // Carrega notificações ao iniciar
  useEffect(() => {
    const loaded = loadNotifications();
    setNotifications(loaded);
  }, []);
  }, []);

  const handleEdit = (notification: AppNotification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      message: notification.message,
      isActive: notification.isActive,
      showOncePerSession: notification.showOncePerSession,
    });
    setIsCreating(false);
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      isActive: false,
      showOncePerSession: true,
    });
    setFormData({
      title: '',
      message: '',
      isActive: false,
      showOncePerSession: true,
    });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.message?.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Título e mensagem são obrigatórios',
        variant: 'destructive',
      toast({
        title: 'Campos obrigatórios',
        description: 'Título e mensagem são obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    const now = new Date();
    let updatedNotifications: AppNotification[];

    if (isCreating) {
      // Cria nova notificação
      // Cria nova notificação
      const newNotification: AppNotification = {
        id: `notification_${Date.now()}`,
        id: `notification_${Date.now()}`,
        title: formData.title!,
        message: formData.message!,
        isActive: formData.isActive!,
        showOncePerSession: formData.showOncePerSession!,
        createdAt: now,
        updatedAt: now,
        shownToUsers: [],
      };


      updatedNotifications = [...notifications, newNotification];
    } else if (editingId) {
      // Atualiza existente
      // Atualiza existente
      updatedNotifications = notifications.map(n => {
        if (n.id === editingId) {
          return {
          return {
            ...n,
            title: formData.title!,
            message: formData.message!,
            isActive: formData.isActive!,
            showOncePerSession: formData.showOncePerSession!,
            updatedAt: now,
          };
          };
        }
        return n;
        return n;
      });
    } else {
      return;
    }

    // Desativa outras notificações se esta for ativada
    if (formData.isActive) {
      updatedNotifications = updatedNotifications.map(n => ({
        ...n,
        isActive: n.id === (editingId || (isCreating ? updatedNotifications[updatedNotifications.length - 1]?.id : ''))
      }));
    }

    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    // Desativa outras notificações se esta for ativada
    if (formData.isActive) {
      updatedNotifications = updatedNotifications.map(n => ({
        ...n,
        isActive: n.id === (editingId || (isCreating ? updatedNotifications[updatedNotifications.length - 1]?.id : ''))
      }));
    }

    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    
    toast({
      title: '✅ Notificação salva!',
      description: isCreating ? 'Nova notificação criada' : 'Notificação atualizada',
      description: isCreating ? 'Nova notificação criada' : 'Notificação atualizada',
    });

    // Limpa formulário
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      title: '',
      message: '',
      isActive: false,
      showOncePerSession: true,
    });
    setFormData({
      title: '',
      message: '',
      isActive: false,
      showOncePerSession: true,
    });
  };

  const handleToggleActive = (id: string) => {
    const updatedNotifications = notifications.map(n => ({
      ...n,
      isActive: n.id === id ? !n.isActive : false, // Só uma ativa por vez
    }));

    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);

    const notification = updatedNotifications.find(n => n.id === id);
    const updatedNotifications = notifications.map(n => ({
      ...n,
      isActive: n.id === id ? !n.isActive : false, // Só uma ativa por vez
    }));

    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);

    const notification = updatedNotifications.find(n => n.id === id);
    toast({
      title: notification?.isActive ? '🔔 Notificação ativada' : '🔕 Notificação desativada',
      description: notification?.isActive 
        ? 'Usuários verão esta mensagem ao abrir o app' 
        : 'Mensagem oculta dos usuários',
      title: notification?.isActive ? '🔔 Notificação ativada' : '🔕 Notificação desativada',
      description: notification?.isActive 
        ? 'Usuários verão esta mensagem ao abrir o app' 
        : 'Mensagem oculta dos usuários',
    });
  };

  const handleDelete = (id: string) => {
    if (notifications.length <= 1) {
      toast({
        title: 'Não é possível excluir',
        description: 'Deve haver pelo menos uma notificação',
        variant: 'destructive',
      toast({
        title: 'Não é possível excluir',
        description: 'Deve haver pelo menos uma notificação',
        variant: 'destructive',
      });
      return;
    }


    const updatedNotifications = notifications.filter(n => n.id !== id);
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    
    toast({
      title: '🗑️ Notificação excluída',
    });
    saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);
    
    toast({
      title: '🗑️ Notificação excluída',
    });
  };

  const activeNotification = notifications.find(n => n.isActive);

  return (
    <div className="space-y-6 pb-[80px]">
    <div className="space-y-6 pb-[80px]">
      {/* Status atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Status da Notificação
          </CardTitle>
          <CardDescription>
            Controle o popup que os usuários veem ao abrir o app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium">Notificação Ativa</p>
                <p className="text-sm text-muted-foreground">
                  {activeNotification 
                    ? `"${activeNotification.title}" está sendo exibida` 
                    : 'Nenhuma notificação ativa no momento'}
                </p>
              </div>
              {activeNotification && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    <Power className="w-3 h-3 mr-1" />
                    Ativa
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(activeNotification)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium">Notificação Ativa</p>
                <p className="text-sm text-muted-foreground">
                  {activeNotification 
                    ? `"${activeNotification.title}" está sendo exibida` 
                    : 'Nenhuma notificação ativa no momento'}
                </p>
              </div>
              {activeNotification && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    <Power className="w-3 h-3 mr-1" />
                    Ativa
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(activeNotification)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              onClick={handleNew}
              className="w-full gap-2"
            >

            <Button
              onClick={handleNew}
              className="w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Nova Notificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Editor de notificação */}
      {(editingId || isCreating) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Criar Nova Notificação' : 'Editar Notificação'}
            </CardTitle>
            <CardTitle>
              {isCreating ? 'Criar Nova Notificação' : 'Editar Notificação'}
            </CardTitle>
            <CardDescription>
              Configure a mensagem que aparecerá para os usuários
              Configure a mensagem que aparecerá para os usuários
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ex: Novidade importante!"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                maxLength={50}
              <Input
                id="title"
                placeholder="Ex: Novidade importante!"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Aparece em destaque no popup
              </p>
              <p className="text-xs text-muted-foreground">
                Aparece em destaque no popup
              </p>
            </div>


            <div className="space-y-2">
              <Label htmlFor="message">Mensagem *</Label>
              <Textarea
                id="message"
                placeholder="Digite a mensagem que os usuários verão..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="resize-none"
                maxLength={500}
              <Textarea
                id="message"
                placeholder="Digite a mensagem que os usuários verão..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                Suporte a múltiplas linhas
              </p>
              <p className="text-xs text-muted-foreground">
                Suporte a múltiplas linhas
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Ativar Notificação</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, usuários verão esta mensagem
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isActive: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Mostrar uma vez por sessão</Label>
                <p className="text-sm text-muted-foreground">
                  Usuário vê apenas uma vez até fechar e reabrir o app
                </p>
              </div>
              <Switch
                checked={formData.showOncePerSession}
                onCheckedChange={(checked) => 
                  setFormData({...formData, showOncePerSession: checked})
                }
              />

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Ativar Notificação</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, usuários verão esta mensagem
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => 
                  setFormData({...formData, isActive: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">Mostrar uma vez por sessão</Label>
                <p className="text-sm text-muted-foreground">
                  Usuário vê apenas uma vez até fechar e reabrir o app
                </p>
              </div>
              <Switch
                checked={formData.showOncePerSession}
                onCheckedChange={(checked) => 
                  setFormData({...formData, showOncePerSession: checked})
                }
              />
            </div>


            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                className="flex-1 gap-2"
              >
              <Button
                onClick={handleSave}
                className="flex-1 gap-2"
              >
                <Save className="w-4 h-4" />
                {isCreating ? 'Criar Notificação' : 'Salvar Alterações'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(false);
                  setFormData({
                    title: '',
                    message: '',
                    isActive: false,
                    showOncePerSession: true,
                  });
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setIsCreating(false);
                  setFormData({
                    title: '',
                    message: '',
                    isActive: false,
                    showOncePerSession: true,
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de notificações */}
      {/* Lista de notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Todas as notificações criadas
            Todas as notificações criadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${notification.isActive ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {notification.isActive && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                          Ativa
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                      {notification.message.length > 100
                        ? `${notification.message.substring(0, 100)}...`
                        : notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(notification.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        {notification.showOncePerSession ? 'Uma vez/sessão' : 'Sempre'}
                      </span>
                      <span>
                        Visto por {notification.shownToUsers.length} usuários
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(notification)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(notification.id)}
                      title={notification.isActive ? 'Desativar' : 'Ativar'}
                      className={notification.isActive ? 'text-primary' : ''}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    
                    {notifications.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${notification.isActive ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {notification.isActive && (
                        <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                          Ativa
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                      {notification.message.length > 100
                        ? `${notification.message.substring(0, 100)}...`
                        : notification.message}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(notification.updatedAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        {notification.showOncePerSession ? 'Uma vez/sessão' : 'Sempre'}
                      </span>
                      <span>
                        Visto por {notification.shownToUsers.length} usuários
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(notification)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(notification.id)}
                      title={notification.isActive ? 'Desativar' : 'Ativar'}
                      className={notification.isActive ? 'text-primary' : ''}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    
                    {notifications.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(notification.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}