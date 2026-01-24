// import { Modal } from '@heroui/react';
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';
// import { useEffect, useState } from 'react';
// import { CheckCircle, XCircle, Loader2, CreditCard, Shield } from 'lucide-react';

// // Chave pública do Stripe
// const stripePromise = loadStripe('pk_live_51QsvOtCpyvWgpfWyznknSkWp6Nj0sHNr2AiUYBC26ubVBn9fCzPEjmTmnaxVtQRZGBohJHrKBPHm7Q1AaXIXMRr600DLmVDOXL');

// function CheckoutForm({ amount, productName, onSuccess, onError, onClose }: any) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [paymentCompleted, setPaymentCompleted] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) {
//       setErrorMessage('Sistema de pagamento não carregado. Tente novamente.');
//       return;
//     }

//     setIsLoading(true);
//     setErrorMessage('');

//     try {
//       const { error } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: `${window.location.origin}/sucesso`,
//         },
//         redirect: 'if_required',
//       });

//       if (error) {
//         setErrorMessage(`Erro: ${error.message}`);
//         onError(error.message);
//       } else {
//         // Simula sucesso para demonstração
//         setTimeout(() => {
//           setPaymentCompleted(true);
//           onSuccess(`pi_${Date.now()}_test`);
//         }, 1500);
//       }
//     } catch (err: any) {
//       setErrorMessage(err.message || 'Erro ao processar pagamento');
//       onError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (paymentCompleted) {
//     return (
//       <div className="text-center py-8">
//         <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//           <CheckCircle className="w-10 h-10 text-green-600" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-900 mb-2">Pagamento Confirmado!</h3>
//         <p className="text-gray-600">Redirecionando...</p>
//       </div>
//     );
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-4">
//         <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
//           <div className="flex items-center gap-3 mb-2">
//             <Shield className="w-5 h-5 text-blue-600" />
//             <span className="font-medium text-blue-800">Pagamento 100% Seguro</span>
//           </div>
//           <p className="text-sm text-blue-700">
//             Seus dados são criptografados e processados pelo Stripe. Não armazenamos informações do cartão.
//           </p>
//         </div>
        
//         <PaymentElement 
//           options={{
//             layout: {
//               type: 'tabs',
//               defaultCollapsed: false,
//             },
//             fields: {
//               billingDetails: {
//                 name: 'auto',
//                 email: 'auto',
//                 phone: 'auto',
//               }
//             }
//           }}
//         />
//       </div>
      
//       {errorMessage && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <div className="flex items-start gap-3">
//             <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//             <div className="flex-1">
//               <p className="text-red-800 font-medium">Erro no pagamento</p>
//               <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <div className="space-y-3">
//         <button 
//           type="submit"
//           disabled={isLoading || !stripe}
//           className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
//         >
//           {isLoading ? (
//             <>
//               <Loader2 className="w-5 h-5 animate-spin" />
//               Processando pagamento...
//             </>
//           ) : (
//             `Confirmar pagamento de R$ ${amount.toFixed(2)}`
//           )}
//         </button>
        
//         <button 
//           type="button"
//           onClick={onClose}
//           className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-4 rounded-lg font-medium transition-colors duration-200 text-sm"
//         >
//           Cancelar compra
//         </button>
//       </div>
//     </form>
//   );
// }

// export function CheckoutModal({ isOpen, onClose, product }: any) {
//   const [clientSecret, setClientSecret] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');

//  const createPaymentIntent = async () => {
//   if (!isOpen) return;
  
//   setIsLoading(true);
//   setError('');
//   setClientSecret('');
  
//   try {
//     console.log('🔄 Criando PaymentIntent para produto:', product);
    
//     // 🔴 ALTERE ESTA LINHA - Use porta 8000 SEM /api/ ou COM /api/
//     const response = await fetch('http://localhost:8000/create-payment-intent', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ 
//         amount: product.preco,
//         currency: 'brl',
//         description: `Compra: ${product.nome}`
//       })
//     });

//     console.log('📦 Status da resposta:', response.status);
    
//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ Erro na resposta:', errorText);
//       throw new Error(`Erro ${response.status}: Não foi possível criar o pagamento`);
//     }
    
//     const data = await response.json();
//     console.log('✅ Dados recebidos:', data);
    
//     if (data.success && data.client_secret) {
//       setClientSecret(data.client_secret);
//     } else {
//       throw new Error(data.detail || 'Resposta inválida do servidor');
//     }
//   } catch (err: any) {
//     console.error('❌ Erro ao criar pagamento:', err);
//     setError(err.message || 'Erro de conexão. Verificando servidor...');
    
//     // Se falhar com uma rota, tenta a outra
//     if (error.includes('8000')) {
//       setTimeout(() => {
//         setError('Tentando rota alternativa...');
//         // Tenta a rota com /api/
//         fetch('http://localhost:8000/api/create-payment-intent', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ 
//             amount: product.preco,
//             currency: 'brl',
//             description: `Compra: ${product.nome}`
//           })
//         })
//         .then(res => res.json())
//         .then(data => {
//           if (data.success && data.client_secret) {
//             setClientSecret(data.client_secret);
//             setError('');
//           }
//         })
//         .catch(() => {
//           setError('Servidor offline. Contate o suporte.');
//         });
//       }, 1000);
//     }
//   } finally {
//     setIsLoading(false);
//   }
// };

//   useEffect(() => {
//     if (isOpen && !clientSecret && !error) {
//       createPaymentIntent();
//     }
//   }, [isOpen]);

//   const handleSuccess = async (paymentId: string) => {
//     console.log('✅ Pagamento bem-sucedido:', paymentId);
    
//     try {
//       const verifyResponse = await fetch(`http://localhost:8000/api/verify-payment/${paymentId}`);
//       if (verifyResponse.ok) {
//         const verifyData = await verifyResponse.json();
//         console.log('📊 Dados da verificação:', verifyData);
//       }
//     } catch (err) {
//       console.log('ℹ️ Não foi possível verificar o pagamento, mas continuando...');
//     }
    
//     onClose();
//     window.location.href = `/sucesso?payment_id=${paymentId}&product=${encodeURIComponent(product.nome)}&amount=${product.preco}`;
//   };

//   const handleError = (message: string) => {
//     console.error('❌ Erro no pagamento:', message);
//     setError(message);
//   };

//   return (
//     <Modal 
//       isOpen={isOpen} 
//       onClose={onClose} 
//       size="lg"
//       hideCloseButton={isLoading}
//       classNames={{
//         base: "max-w-md mx-auto",
//         wrapper: "z-[9999]",
//         body: "p-0"
//       }}
//     >
//       <div className="p-6">
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">Finalizar Compra</h2>
//             <p className="text-gray-600 mt-1">Complete seu pedido com segurança</p>
//           </div>
//         </div>
        
//         {/* Resumo do Produto */}
//         <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
//           <div className="flex justify-between items-start">
//             <div className="flex-1">
//               <p className="font-semibold text-gray-900">{product.nome}</p>
//               {product.originalPreco && product.originalPreco > product.preco && (
//                 <div className="flex items-center gap-2 mt-1">
//                   <span className="text-sm text-gray-500 line-through">
//                     R$ {product.originalPreco.toFixed(2)}
//                   </span>
//                   <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
//                     -{Math.round(100 - (product.preco * 100 / product.originalPreco))}%
//                   </span>
//                 </div>
//               )}
//             </div>
//             <div className="text-right">
//               <p className="text-2xl font-bold text-green-700">
//                 R$ {product.preco.toFixed(2)}
//               </p>
//               <p className="text-xs text-gray-500 mt-1">Total a pagar</p>
//             </div>
//           </div>
//         </div>
        
//         {/* Mensagens de Erro */}
//         {error && (
//           <div className="mb-6">
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
//               <div className="flex items-start gap-3">
//                 <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 mt-0.5">
//                   <span className="text-yellow-800 text-xs font-bold">!</span>
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-yellow-800 font-medium">Atenção</p>
//                   <p className="text-yellow-700 text-sm mt-1">{error}</p>
//                   <button
//                     onClick={createPaymentIntent}
//                     className="mt-3 text-sm text-yellow-800 hover:text-yellow-900 font-medium"
//                   >
//                     Tentar novamente
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Loading ou Formulário */}
//         {isLoading ? (
//           <div className="text-center py-8">
//             <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
//             <p className="mt-4 text-gray-600 font-medium">Iniciando checkout seguro...</p>
//             <p className="text-sm text-gray-500 mt-2">Por favor, aguarde</p>
//           </div>
//         ) : clientSecret ? (
//           <Elements 
//             stripe={stripePromise} 
//             options={{
//               clientSecret,
//               appearance: {
//                 theme: 'stripe',
//                 variables: {
//                   colorPrimary: '#16a34a',
//                   colorBackground: '#ffffff',
//                   colorText: '#111827',
//                   colorDanger: '#dc2626',
//                   fontFamily: 'system-ui, sans-serif',
//                   spacingUnit: '4px',
//                   borderRadius: '8px',
//                 },
//                 rules: {
//                   '.Input': {
//                     border: '1px solid #d1d5db',
//                     padding: '12px',
//                     fontSize: '16px'
//                   },
//                   '.Label': {
//                     fontWeight: '500',
//                     marginBottom: '4px'
//                   }
//                 }
//               }
//             }}
//           >
//             <CheckoutForm 
//               amount={product.preco}
//               productName={product.nome}
//               onSuccess={handleSuccess}
//               onError={handleError}
//               onClose={onClose}
//             />
//           </Elements>
//         ) : (
//           <div className="text-center py-8">
//             <div className="animate-pulse space-y-4">
//               <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
//               <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
//             </div>
//           </div>
//         )}
        
//         {/* Rodapé */}
//         <div className="mt-6 pt-6 border-t border-gray-200">
//           <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
//             <div className="flex items-center gap-1.5">
//               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//               <span>SSL 256-bit</span>
//             </div>
//             <div className="flex items-center gap-1.5">
//               <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//               <span>Stripe Certified</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Modal>
//   );
// }