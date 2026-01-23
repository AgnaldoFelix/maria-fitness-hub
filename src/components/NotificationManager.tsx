import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Edit2, Power, Bell, Trash2, Plus, Send, Bug, Eye, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  loadNotifications, 
  saveNotifications, 
  type AppNotification, 
  activateNotification, 
  resetNotificationViews,
  getDebugLogs,
  clearDebugLogs,
  logDebug 
} from '@/utils/notificationStorage';
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
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<any[]>([]);

  useEffect(() => {
    refreshNotifications();
  }, []);

  const refreshNotifications = () => {
    const loaded = loadNotifications();
    setNotifications(loaded);
    setDebugLogs(getDebugLogs());
  };

  const handleEdit = (notification: AppNotification) => {
    setEditingId(notification.id);
    setFormData({
      title: notification.title,
      message: notification.message,
      isActive: notification.isActive,
      showOncePerSession: notification.showOncePerSession,
    });
    setIsCreating(false);
    logDebug('Editando notificação', { id: notification.id });
  };

  const handleNew = () => {
    setEditingId(null);
    setFormData({ title: '', message: '', isActive: false, showOncePerSession: true });
    setIsCreating(true);
    logDebug('Criando nova notificação');
  };

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.message?.trim()) {
      toast({ 
        title: 'Campos obrigatórios', 
        description: 'Título e mensagem são obrigatórios', 
        variant: "destructive" 
      });
      return;
    }

    const now = new Date();
    let updatedNotifications: AppNotification[];

    if (isCreating) {
      const newNotification: AppNotification = {
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: formData.title!,
        message: formData.message!,
        isActive: formData.isActive!,
        showOncePerSession: formData.showOncePerSession!,
        createdAt: now,
        updatedAt: now,
        shownToUsers: [],
      };
      
      updatedNotifications = [...notifications, newNotification];
      
      // Se está sendo criada como ativa, ativa ela
      if (formData.isActive) {
        activateNotification(newNotification.id);
        logDebug('Nova notificação criada e ativada', { id: newNotification.id });
      } else {
        saveNotifications(updatedNotifications);
        logDebug('Nova notificação criada (inativa)', { id: newNotification.id });
      }
    } else if (editingId) {
      const wasActive = notifications.find(n => n.id === editingId)?.isActive || false;
      
      updatedNotifications = notifications.map(n => {
        if (n.id === editingId) {
          const updated = {
            ...n,
            title: formData.title!,
            message: formData.message!,
            isActive: formData.isActive!,
            showOncePerSession: formData.showOncePerSession!,
            updatedAt: now,
            // Se estava inativa e agora será ativada, reseta visualizações
            shownToUsers: (!wasActive && formData.isActive) ? [] : n.shownToUsers,
          };
          return updated;
        }
        // Desativa outras se esta está sendo ativada
        return formData.isActive ? { ...n, isActive: false } : n;
      });
      
      saveNotifications(updatedNotifications);
      
      if (formData.isActive && !wasActive) {
        logDebug('Notificação ativada via edição', { id: editingId });
      } else {
        logDebug('Notificação atualizada', { id: editingId, isActive: formData.isActive });
      }
    } else {
      return;
    }

    refreshNotifications();
    
    toast({
      title: '✅ Notificação salva!',
      description: formData.isActive 
        ? 'Notificação ativada e pronta para ser exibida' 
        : 'Notificação salva',
    });

    // Limpa formulário
    setEditingId(null);
    setIsCreating(false);
    setFormData({ title: '', message: '', isActive: false, showOncePerSession: true });
  };

  const handleToggleActive = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    if (!notification) return;
    
    if (!notification.isActive) {
      // Ativando
      activateNotification(id);
      logDebug('Notificação ativada via toggle', { id });
      
      toast({
        title: '🔔 Notificação ativada!',
        description: 'Todos os usuários verão esta mensagem',
        duration: 3000,
      });
    } else {
      // Desativando
      const updatedNotifications = notifications.map(n => ({
        ...n,
        isActive: n.id === id ? false : n.isActive,
      }));
      
      saveNotifications(updatedNotifications);
      logDebug('Notificação desativada via toggle', { id });
      
      toast({
        title: '🔕 Notificação desativada',
        description: 'Mensagem não será mais exibida',
      });
    }
    
    refreshNotifications();
  };

  const handleResendToAll = (id: string) => {
    resetNotificationViews(id);
    logDebug('Visualizações resetadas para reenvio', { id });
    
    toast({
      title: '🔄 Notificação reenviada!',
      description: 'Todos os usuários verão novamente',
    });
    
    refreshNotifications();
  };

  const handleDelete = (id: string) => {
    if (notifications.length <= 1) {
      toast({ 
        title: 'Não é possível excluir', 
        description: 'Deve haver pelo menos uma notificação', 
        variant: "destructive" 
      });
      return;
    }
    
    const updatedNotifications = notifications.filter(n => n.id !== id);
    
    // Se estava excluindo a notificação ativa, ativa a primeira disponível
    const wasActive = notifications.find(n => n.id === id)?.isActive;
    if (wasActive && updatedNotifications.length > 0) {
      activateNotification(updatedNotifications[0].id);
      logDebug('Notificação ativa excluída, ativando próxima', { 
        deletedId: id, 
        newActiveId: updatedNotifications[0].id 
      });
    } else {
      saveNotifications(updatedNotifications);
      logDebug('Notificação excluída', { id });
    }
    
    refreshNotifications();
    toast({ title: '🗑️ Notificação excluída' });
  };

  const handleTestNotification = () => {
    const activeNotification = notifications.find(n => n.isActive);
    
    if (activeNotification) {
      // Simula um novo usuário vendo a notificação
      resetNotificationViews(activeNotification.id);
      logDebug('Teste: visualizações resetadas para teste', { id: activeNotification.id });
      
      toast({
        title: '🧪 Teste iniciado',
        description: 'A notificação será exibida novamente em instantes',
      });
      
      // Força um evento de storage para disparar a verificação
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'app_notifications',
        newValue: localStorage.getItem('app_notifications')
      }));
    } else {
      toast({
        title: '⚠️ Nenhuma notificação ativa',
        description: 'Ative uma notificação primeiro',
        variant: 'destructive'
      });
    }
  };

  const activeNotification = notifications.find(n => n.isActive);

  return (
    <div className="space-y-6">
      {/* Botão de debug */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowDebug(!showDebug);
            refreshNotifications();
          }}
          className="gap-2"
        >
          <Bug className="w-4 h-4" />
          {showDebug ? 'Ocultar Debug' : 'Mostrar Debug'}
        </Button>
      </div>

      {/* Painel de debug */}
      {showDebug && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              Painel de Debug
            </CardTitle>
            <CardDescription className="text-amber-600">
              Logs do sistema de notificações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshNotifications}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Atualizar Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDebugLogs}
                  className="gap-2 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  Limpar Logs
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestNotification}
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Testar Notificação
                </Button>
              </div>
              
              <div className="text-sm">
                <p className="font-medium mb-2">Status Atual:</p>
                <ul className="space-y-1">
                  <li>• Total de notificações: {notifications.length}</li>
                  <li>• Notificação ativa: {activeNotification ? activeNotification.title : 'Nenhuma'}</li>
                  <li>• Usuários já viram: {activeNotification?.shownToUsers.length || 0}</li>
                  <li>• Logs registrados: {debugLogs.length}</li>
                </ul>
              </div>
              
              {debugLogs.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium mb-2 text-sm">Últimos Logs:</p>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 bg-white">
                    {[...debugLogs].reverse().slice(0, 10).map((log, index) => (
                      <div key={index} className="border-b py-2 last:border-0">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </p>
                        <p className="text-sm">{log.message}</p>
                        {log.data && (
                          <p className="text-xs text-gray-500 mt-1">{log.data}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className={`p-4 rounded-lg ${activeNotification ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificação Ativa</p>
                  <p className="text-sm text-muted-foreground">
                    {activeNotification 
                      ? `"${activeNotification.title}" está pronta para exibição` 
                      : 'Nenhuma notificação ativa no momento'}
                  </p>
                  {activeNotification && (
                    <p className="text-xs text-green-600 mt-1">
                      👁️ Visto por {activeNotification.shownToUsers.length} usuário(s)
                    </p>
                  )}
                </div>
                {activeNotification && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                      <Power className="w-3 h-3 mr-1" /> Ativa
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(activeNotification)} 
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleResendToAll(activeNotification.id)} 
                      title="Reenviar para todos"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <Button onClick={handleNew} className="w-full gap-2">
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
            <CardTitle>{isCreating ? 'Criar Nova Notificação' : 'Editar Notificação'}</CardTitle>
            <CardDescription>
              {isCreating 
                ? 'Crie uma nova mensagem para exibir aos usuários' 
                : 'Atualize a mensagem. Ao ativar, todos os usuários verão novamente.'}
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
              />
              <p className="text-xs text-muted-foreground">Aparece em destaque no popup</p>
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
              />
              <p className="text-xs text-muted-foreground">Suporte a múltiplas linhas</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-base">Ativar Notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isActive 
                      ? '✅ Todos os usuários verão esta mensagem ao abrir o app' 
                      : '❌ Mensagem oculta dos usuários'}
                  </p>
                </div>
                <Switch 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} 
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
                  onCheckedChange={(checked) => setFormData({...formData, showOncePerSession: checked})} 
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="w-4 h-4" />
                {isCreating ? 'Criar Notificação' : 'Salvar Alterações'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => { 
                  setEditingId(null); 
                  setIsCreating(false); 
                  setFormData({ title: '', message: '', isActive: false, showOncePerSession: true }); 
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Gerencie todas as notificações criadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma notificação criada ainda
              </div>
            ) : (
              notifications.map((notification) => (
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
                          👁️ {notification.shownToUsers.length} visualização(ões)
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
                      
                      {notification.isActive && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleResendToAll(notification.id)} 
                          title="Reenviar para todos"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}