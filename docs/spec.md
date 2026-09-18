# Software Specification: Interactive Trigonometry Simulator (Right-Angled Triangle)

## 1. Visão Geral

Aplicação interativa web/desktop minimalista para demonstrar visualmente as funções trigonométricas Seno e Cosseno em um triângulo retângulo a partir da manipulação da hipotenusa pelo usuário.

---

## 2. Requisitos de Interação e Vetores

- **Ponto de Origem Fixo (Vértice $A$):** Localizado na parte inferior esquerda do Canvas: $(x_0, y_0)$.
- **Manipulador de Mouse (Vértice $B$):**
  - A extremidade da hipotenusa deve poder ser arrastada livremente com o mouse ou ajustada via slider.
  - Cálculo do ângulo relativo ao eixo horizontal:
    $$\theta = \operatorname{atan2}(-(y_m - y_0), x_m - x_0)$$
  - O ângulo deve ser limitado (clamped) estritamente entre $1^\circ$ e $89^\circ$ (para preservar a visibilidade física do triângulo retângulo no 1º quadrante).
  - O comprimento da hipotenusa $H$ pode ser fixo ou redimensionável: $H = \sqrt{(x_m - x_0)^2 + (y_m - y_0)^2}$.
- **Vértice Retângulo (Vértice $C$):**
  - Projeção ortogonal no eixo X: $(x_0 + H \cdot \cos\theta, y_0)$.
  - Desenhar o símbolo tradicional de ângulo reto ($90^\circ$) com um pequeno quadrado e ponto central neste vértice.

---

## 3. Visualização Gráfica (Canvas 2D)

- **Codificação por Cores Consistente:**
  - **Hipotenusa ($H$):** Roxo/Violeta (ex: `#8B5CF6`).
  - **Cateto Adjacente ($C_a$ / Base):** Azul ciano (ex: `#0284C7`).
  - **Cateto Oposto ($C_o$ / Altura):** Vermelho/Laranja (ex: `#EF4444`).
  - **Arco do Ângulo ($\theta$):** Desenhar arco suave de raio $r \approx 30\text{px}$ no vértice da origem, com rótulo "$\theta$".
- **Feedback Visual:**
  - Cursor `grab` / `grabbing` no vértice interativo da hipotenusa.
  - Hover highlight no nó arrastável.

---

## 4. Painel Didático de Relações Matemáticas (Side Panel / HUD)

A interface deve exibir e recalcular em tempo real:

1. **Ângulo Atual:** Valor em graus ($\theta^\circ$) e radianos ($\text{rad}$).
2. **Medidas Lineares:**
   - Comprimento da Hipotenusa: $H$
   - Cateto Adjacente: $C_a = H \cdot \cos(\theta)$
   - Cateto Oposto: $C_o = H \cdot \sin(\theta)$
3. **Fórmulas Trigonométricas Explicadas:**
   - $\operatorname{sen}(\theta) = \frac{\text{Cateto Oposto}}{\text{Hipotenusa}} = \frac{C_o}{H} = \dots$
   - $\cos(\theta) = \frac{\text{Cateto Adjacente}}{\text{Hipotenusa}} = \frac{C_a}{H} = \dots$
   - Identidade Fundamental: $\operatorname{sen}^2(\theta) + \cos^2(\theta) = 1.000$ (demonstrando a soma dos quadrados).

---

## 5. Requisitos de Entrega de Código

- Gerar código pronto para rodar (`index.html`, `style.css` e `main.js` ou um componente único em React/TypeScript com Tailwind/Vite).
- O Canvas deve lidar com o `devicePixelRatio` da tela para evitar bordas pixeladas.
