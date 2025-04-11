<style scoped>
.items-panel {
  @apply w-full rounded-lg p-4 bg-dark overflow-hidden;
  background: linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.95));
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
  position: relative;
}

.items-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #f39c12, #f1c40f);
}

.panel-header {
  @apply flex justify-between items-center mb-4 pb-2;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
}

.panel-title {
  @apply text-xl font-bold flex items-center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.panel-title svg {
  @apply mr-2;
  color: #f1c40f;
}

.items-container {
  @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3;
}

.item-card {
  @apply bg-dark-light rounded-lg p-3 flex flex-col items-center;
  border: 1px solid rgba(75, 85, 99, 0.3);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  border-color: rgba(241, 196, 15, 0.5);
}

.item-card:hover .item-image {
  transform: scale(1.08);
}

.item-image-container {
  @apply w-16 h-16 mb-2 flex items-center justify-center rounded-lg overflow-hidden;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.item-image {
  @apply w-4/5 h-4/5 object-contain;
  transition: transform 0.3s ease;
}

.item-rarity {
  @apply absolute top-0 right-0 w-2 h-2 rounded-full;
  box-shadow: 0 0 5px currentColor;
}

.common { @apply bg-gray-400; }
.uncommon { @apply bg-green-400; }
.rare { @apply bg-blue-400; }
.epic { @apply bg-purple-400; }
.legendary { 
  @apply bg-yellow-400;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(241, 196, 15, 0); }
  100% { box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); }
}

.item-name {
  @apply text-sm font-semibold text-center mb-1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.item-description {
  @apply text-xs text-gray-400 text-center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-stats {
  @apply w-full mt-2 text-xs text-gray-300 flex flex-col gap-1;
}

.stat-row {
  @apply flex justify-between items-center;
  padding: 2px 0;
  border-top: 1px dotted rgba(75, 85, 99, 0.3);
}

.stat-label {
  @apply font-medium;
}

.stat-value {
  @apply font-bold;
}

.item-actions {
  @apply mt-3 w-full flex justify-center gap-2;
}

.item-btn {
  @apply px-3 py-1 text-xs font-medium rounded;
  transition: all 0.15s ease;
}

.item-btn:hover {
  transform: scale(1.05);
}

.use-btn {
  background: linear-gradient(to right, #2ecc71, #27ae60);
  box-shadow: 0 2px 5px rgba(46, 204, 113, 0.3);
}

.use-btn:hover {
  background: linear-gradient(to right, #3ae485, #2ecc71);
  box-shadow: 0 3px 7px rgba(46, 204, 113, 0.4);
}

.sell-btn {
  background: linear-gradient(to right, #e74c3c, #c0392b);
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.3);
}

.sell-btn:hover {
  background: linear-gradient(to right, #f55a4a, #e74c3c);
  box-shadow: 0 3px 7px rgba(231, 76, 60, 0.4);
}

.empty-state {
  @apply w-full py-10 flex flex-col items-center justify-center text-gray-400;
}

.empty-icon {
  @apply text-4xl mb-3;
  opacity: 0.5;
}

.empty-text {
  @apply text-sm;
}

.component-card {
  position: relative;
}

.component-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #3498db, #2980b9);
}

.recipe-overlay {
  @apply absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
}

.item-card:hover .recipe-overlay {
  opacity: 1;
}

.recipe-text {
  @apply text-xs font-bold text-white p-1 rounded;
  background-color: rgba(0, 0, 0, 0.7);
}

.equippable {
  position: relative;
}

.equippable::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #3498db;
  border-radius: 50%;
  z-index: 5;
}

/* Tooltip styles */
.tooltip {
  @apply absolute z-50 p-2 rounded text-xs bg-dark-light;
  width: max-content;
  max-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(5px);
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.5);
  pointer-events: none;
}

.item-card:hover .tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
</style> 