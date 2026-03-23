import type { EditorApp } from './EditorApp';

export class Shortcuts {
  private app: EditorApp;

  constructor(app: EditorApp) {
    this.app = app;
    document.addEventListener('keydown', (e) => this.handleKey(e));
  }

  private handleKey(e: KeyboardEvent): void {
    // Ignore when typing in inputs
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Ctrl shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        this.app.save();
        return;
      }
      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        this.app.redo();
        return;
      }
      if (e.key === 'z') {
        e.preventDefault();
        this.app.undo();
        return;
      }
      if (e.key === 'y') {
        e.preventDefault();
        this.app.redo();
        return;
      }
      return;
    }

    switch (e.key.toLowerCase()) {
      case 'b': this.app.selectTool('brush'); break;
      case 'e': this.app.selectTool('eraser'); break;
      case 'f': this.app.selectTool('fill'); break;
      case 'r': this.app.selectTool('rect'); break;
      case 'g': this.app.toggleGrid(); break;
    }
  }
}
