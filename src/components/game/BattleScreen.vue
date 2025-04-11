<style scoped>
.battle-screen {
  @apply w-full flex flex-col items-center justify-center p-4 rounded-lg;
  background: linear-gradient(to bottom, rgba(30, 41, 59, 0.8), rgba(17, 24, 39, 0.8));
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.3);
  min-height: 600px;
}

.battle-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, transparent, rgba(99, 102, 241, 0.8), transparent);
}

.battle-header {
  @apply w-full flex justify-between items-center p-4 mb-4 bg-dark rounded-lg;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.battle-title {
  @apply text-xl font-bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  position: relative;
  padding-left: 0.5rem;
}

.battle-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.2em;
  background: #6c5ce7;
  border-radius: 2px;
}

.battle-round {
  @apply text-lg font-bold px-3 py-1 rounded-full;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.battle-container {
  @apply w-full flex flex-col sm:flex-row gap-4;
}

.arena-side {
  @apply flex-1 flex flex-col items-center bg-dark p-3 rounded-lg;
  position: relative;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(75, 85, 99, 0.2);
}

.player-field {
  background: linear-gradient(to bottom, rgba(46, 49, 146, 0.1), rgba(46, 49, 146, 0.3));
  border-bottom: 2px solid rgba(99, 102, 241, 0.3);
}

.enemy-field {
  background: linear-gradient(to bottom, rgba(146, 49, 49, 0.1), rgba(146, 49, 49, 0.3));
  border-bottom: 2px solid rgba(220, 38, 38, 0.3);
}

.field-header {
  @apply w-full flex justify-between items-center mb-3 pb-2 text-sm;
  border-bottom: 1px solid rgba(75, 85, 99, 0.3);
}

.field-title {
  @apply font-bold;
  letter-spacing: 0.5px;
}

.field-stats {
  @apply flex items-center gap-2;
}

.stat-item {
  @apply flex items-center gap-1 px-2 py-1 rounded bg-dark-light;
  border: 1px solid rgba(75, 85, 99, 0.3);
}

.characters-grid {
  @apply grid grid-cols-3 gap-2 w-full;
  min-height: 200px;
}

.character-slot {
  @apply flex flex-col items-center justify-center bg-dark-light p-2 rounded;
  height: 100px;
  border: 1px dashed rgba(75, 85, 99, 0.3);
  transition: all 0.2s ease;
}

.character-slot:hover {
  background-color: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.occupied {
  @apply bg-dark-light border-solid relative;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.occupied:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.character-art {
  @apply w-12 h-12 mb-2 rounded-full bg-cover bg-center;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.character-name {
  @apply text-xs font-semibold truncate w-full text-center;
  max-width: 90px;
}

.character-health {
  @apply w-full h-1.5 mt-1 bg-dark rounded-full overflow-hidden;
}

.health-bar {
  @apply h-full;
  background: linear-gradient(to right, #ff5252, #ff7675);
  transition: width 0.3s ease;
}

.battle-log {
  @apply w-full mt-4 p-3 rounded-lg bg-dark max-h-60 overflow-y-auto;
  border: 1px solid rgba(75, 85, 99, 0.3);
  font-family: 'Courier New', monospace;
}

.log-header {
  @apply font-bold pb-2 mb-2 border-b border-gray-700;
}

.log-entry {
  @apply text-sm py-1;
  padding-left: 1rem;
  position: relative;
  transition: all 0.2s ease;
}

.log-entry:hover {
  background-color: rgba(75, 85, 99, 0.2);
}

.log-entry::before {
  content: '>';
  position: absolute;
  left: 0;
  color: #6c5ce7;
}

.log-attack {
  color: #ff7675;
}

.log-defense {
  color: #74b9ff;
}

.log-heal {
  color: #55efc4;
}

.log-death {
  color: #ff6b6b;
  font-weight: 600;
}

.battle-actions {
  @apply w-full flex justify-center gap-4 mt-6 pt-4;
  border-top: 1px solid rgba(75, 85, 99, 0.3);
}

.action-btn {
  @apply px-5 py-2.5 rounded-lg font-medium text-white transition-all;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.btn-auto {
  background: linear-gradient(to right, #6c5ce7, #4834d4);
  border: none;
}

.btn-auto:hover {
  background: linear-gradient(to right, #7d6ef0, #5e48f0);
}

.btn-skip {
  background: linear-gradient(to right, #636e72, #454f52);
  border: none;
}

.btn-skip:hover {
  background: linear-gradient(to right, #78868a, #576166);
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.attack-animation {
  animation: bounce 0.3s ease-in-out 1;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.damage-number {
  @apply absolute text-white font-bold;
  animation: fadeInUp 0.5s ease-in-out forwards;
  pointer-events: none;
}
</style> 