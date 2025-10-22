import mustache from 'mustache';

export function renderTemplate(template: string, data: Record<string, any>): string {
  return mustache.render(template, data);
}