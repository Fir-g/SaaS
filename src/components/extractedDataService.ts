@@ .. @@
    if (name.includes('portfolio') || name.includes('summary')) {
      return { 
        label: 'SUMMARY',
-        color: 'text-[#3b1344]', 
-        bgColor: 'bg-[#3b1344]/10'
+        color: 'text-brand-primary', 
+        bgColor: 'bg-brand-light'
      };
    }
    if (name.includes('transaction')) {
      return { 
        label: 'TRANSACTION',
-        color: 'text-purple-600', 
-        bgColor: 'bg-purple-50'
+        color: 'text-brand-accent', 
+        bgColor: 'bg-brand-accent/10'
      };
    }