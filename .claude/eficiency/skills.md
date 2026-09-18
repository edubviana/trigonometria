# Skill: Token Efficiency & Minimalist Execution

## Directives

1. **Zero Conversational Overhead:**
   - Omita saudações, introduções corteses e resumos conclusivos.
   - Forneça apenas raciocínio direto e ações objetivas.

2. **Diffs & Targeted Edits Over Full Rewrites:**
   - Ao modificar código, nunca reescreva arquivos inteiros.
   - Use edições pontuais (patches/diffs cirúrgicos) indicando apenas os blocos alterados com comentários de contexto.

3. **Surgical File Inspection:**
   - Não leia arquivos completos se precisar apenas de uma função ou trecho específico.
   - Use comandos direcionados (`grep`, visualização por linhas) em vez de carregar módulos inteiros para a janela de contexto.

4. **Concise Explanations:**
   - Explicações textuais devem se limitar a no máximo 2 a 3 frases explicativas sobre o que foi modificado e o porquê.
   - Dispense explicações didáticas de conceitos básicos da linguagem, a menos que explicitamente solicitado.
