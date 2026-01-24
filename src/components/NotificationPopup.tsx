// import { X, Bell } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { AppNotification } from "@/utils/notificationStorage";

// interface NotificationPopupProps {
//   notification: AppNotification;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export function NotificationPopup({ notification, isOpen, onClose }: NotificationPopupProps) {
//   if (!isOpen || !notification) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-300">
//         <Card className="relative overflow-hidden border-0 shadow-xl">
//           <div className="bg-gradient-to-r from-primary to-primary/80 p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="rounded-full bg-white/20 p-2">
//                   <Bell className="h-5 w-5 text-white" />
//                 </div>
//                 <h2 className="text-lg font-semibold text-white">
//                   {notification.title}
//                 </h2>
//               </div>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 text-white hover:bg-white/20"
//                 onClick={onClose}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
          
//           <CardContent className="p-6">
//             <div className="space-y-4">
//               <p className="text-foreground whitespace-pre-line">
//                 {notification.message}
//               </p>
              
//               {notification.showOncePerSession && (
//                 <div className="rounded-lg bg-primary/5 p-3">
//                   <p className="text-xs text-primary flex items-center gap-1">
//                     <Bell className="h-3 w-3" />
//                     Esta mensagem será exibida apenas uma vez por sessão
//                   </p>
//                 </div>
//               )}
              
//               <div className="flex gap-2 pt-2">
//                 <Button onClick={onClose} className="flex-1" variant="outline">
//                   Fechar
//                 </Button>
//                 <Button onClick={onClose} className="flex-1">
//                   Entendi
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
          
//           <div className="border-t px-6 py-3">
//             <p className="text-xs text-muted-foreground text-center">
//               Mensagem do administrador
//             </p>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }