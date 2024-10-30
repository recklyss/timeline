import { Plugin } from 'obsidian';
import { TimelineView, VIEW_TYPE_TIMELINE } from './views/TimelineView';
import { TimelinePluginSettings, DEFAULT_SETTINGS } from './types';
import { parseTimelineContent } from './utils/parser';

export default class TimelinePlugin extends Plugin {
    settings: TimelinePluginSettings;
    private timelineView: TimelineView | null = null;

    async onload() {
        await this.loadSettings();

        // Register timeline view
        this.registerView(
            VIEW_TYPE_TIMELINE,
            (leaf) => (this.timelineView = new TimelineView(leaf))
        );

        // Register code block processor for timeline
        this.registerMarkdownCodeBlockProcessor('timeline', (source, el, ctx) => {
            // Create a container for the timeline
            const container = el.createEl('div', { cls: 'timeline-container' });
            
            const events = parseTimelineContent(source);
            const timeline = container.createEl("div", { cls: "timeline" });
            
            events.forEach(event => {
                const eventEl = timeline.createEl("div", { cls: "timeline-event" });
                
                const dateEl = eventEl.createEl("div", { cls: "timeline-date" });
                dateEl.createEl("span", { cls: "timeline-year", text: event.year });
                dateEl.createEl("span", { cls: "timeline-month", text: event.date });
                
                eventEl.createEl("div", { cls: "timeline-point" });
                
                const contentEl = eventEl.createEl("div", { cls: "timeline-content" });
                contentEl.createEl("h3", { text: event.title });
                contentEl.createEl("p", { text: event.content });
            });
        });

        // Add ribbon icon
        this.addRibbonIcon('clock', 'Timeline View', () => {
            this.activateView();
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(VIEW_TYPE_TIMELINE)[0];

        if (!leaf) {
            leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf(false);
            await leaf.setViewState({ type: VIEW_TYPE_TIMELINE });
        }

        workspace.revealLeaf(leaf);
    }
} 