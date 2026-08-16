import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './src/server/db.js';
import { generateFullProposal, regenerateProposalSection } from './src/server/gemini.js';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Dummy session auth state check helper
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'agency2026!';

  // ==================== API ROUTES ====================

  // Auth APIs
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      return res.json({
        success: true,
        user: {
          id: 'usr-1',
          username: ADMIN_USER,
          name: 'Agency Admin',
          email: 'admin@apexdigital.io',
          role: 'admin',
        },
        token: 'agency-admin-token-2026',
      });
    }
    return res.status(401).json({ error: 'Invalid username or password. Default credentials are admin / agency2026!' });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    return res.json({ success: true, message: 'Logged out successfully' });
  });

  app.get('/api/auth/me', (_req: Request, res: Response) => {
    return res.json({
      user: {
        id: 'usr-1',
        username: ADMIN_USER,
        name: 'Agency Admin',
        email: 'admin@apexdigital.io',
        role: 'admin',
      },
    });
  });

  // Dashboard API
  app.get('/api/dashboard', async (_req: Request, res: Response) => {
    try {
      const metrics = await db.getDashboardMetrics();
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch dashboard metrics' });
    }
  });

  // Settings APIs
  app.get('/api/settings', async (_req: Request, res: Response) => {
    try {
      const settings = await db.getSettings();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const updated = await db.updateSettings(req.body);
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update settings' });
    }
  });

  // Supabase SQL DDL Schema export route
  app.get('/api/schema/sql', (_req: Request, res: Response) => {
    const sql = db.getSupabaseSchemaSql();
    return res.type('text/plain').send(sql);
  });

  // Templates APIs
  app.get('/api/templates', async (_req: Request, res: Response) => {
    try {
      const templates = await db.getTemplates();
      return res.json(templates);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch templates' });
    }
  });

  app.post('/api/templates', async (req: Request, res: Response) => {
    try {
      const newTpl = await db.createTemplate(req.body);
      return res.status(201).json(newTpl);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create template' });
    }
  });

  app.put('/api/templates/:id', async (req: Request, res: Response) => {
    try {
      const updated = await db.updateTemplate(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Template not found' });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update template' });
    }
  });

  app.delete('/api/templates/:id', async (req: Request, res: Response) => {
    try {
      const success = await db.deleteTemplate(req.params.id);
      if (!success) return res.status(404).json({ error: 'Template not found' });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete template' });
    }
  });

  // Proposals APIs
  app.get('/api/proposals', async (req: Request, res: Response) => {
    try {
      const search = req.query.search as string;
      const status = req.query.status as string;
      const proposals = await db.getProposals(search, status);
      return res.json(proposals);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch proposals' });
    }
  });

  app.get('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      const proposal = await db.getProposalById(req.params.id);
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

      const versions = await db.getProposalVersions(req.params.id);
      return res.json({ proposal, versions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch proposal' });
    }
  });

  app.post('/api/proposals', async (req: Request, res: Response) => {
    try {
      const created = await db.createProposal(req.body);
      return res.status(201).json(created);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to create proposal' });
    }
  });

  app.put('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      const changelog = req.body.changelogReason || 'Manual edit in proposal editor';
      delete req.body.changelogReason;

      const updated = await db.updateProposal(req.params.id, req.body, changelog);
      if (!updated) return res.status(404).json({ error: 'Proposal not found' });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update proposal' });
    }
  });

  app.delete('/api/proposals/:id', async (req: Request, res: Response) => {
    try {
      const success = await db.deleteProposal(req.params.id);
      if (!success) return res.status(404).json({ error: 'Proposal not found' });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete proposal' });
    }
  });

  // AI Full Proposal Generation API
  app.post('/api/proposals/:id/generate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const proposal = await db.getProposalById(id);
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

      const settings = await db.getSettings();

      const { serviceDescription, keyChallenges, customPromptNotes } = req.body;

      // Update proposal notes if provided
      if (serviceDescription || keyChallenges || customPromptNotes) {
        proposal.customNotes = customPromptNotes || proposal.customNotes;
      }

      console.log(`Generating full AI proposal for ${proposal.clientCompany}...`);
      const generatedSections = await generateFullProposal({
        clientName: proposal.clientName,
        clientCompany: proposal.clientCompany,
        clientEmail: proposal.clientEmail,
        serviceType: proposal.serviceType,
        serviceDescription: serviceDescription || proposal.summary || 'Custom Software Development Services',
        keyChallenges,
        tone: proposal.tone,
        customPromptNotes: customPromptNotes || proposal.customNotes,
        agencyName: settings.agencyName,
        customSystemPrompt: settings.defaultSystemPrompt,
      });

      const updatedProposal = await db.updateProposal(
        id,
        {
          sections: generatedSections,
          status: 'under_review',
        },
        'Full AI Proposal Generation via Gemini'
      );

      return res.json({ success: true, proposal: updatedProposal });
    } catch (err: any) {
      console.error('Generation endpoint error:', err);
      return res.status(500).json({ error: err.message || 'Failed to generate proposal using AI' });
    }
  });

  // AI Section Regeneration API
  app.post('/api/proposals/:id/regenerate', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { sectionKey, instructions } = req.body;

      if (!sectionKey || !instructions) {
        return res.status(400).json({ error: 'sectionKey and instructions are required' });
      }

      const proposal = await db.getProposalById(id);
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

      const sectionIdx = proposal.sections.findIndex((s) => s.key === sectionKey);
      if (sectionIdx === -1) return res.status(404).json({ error: 'Section not found' });

      const targetSection = proposal.sections[sectionIdx];
      const settings = await db.getSettings();

      console.log(`Regenerating section ${sectionKey} for proposal ${id}...`);
      const newContent = await regenerateProposalSection({
        sectionKey,
        sectionTitle: targetSection.title,
        currentContent: targetSection.content,
        instructions,
        clientCompany: proposal.clientCompany,
        serviceType: proposal.serviceType,
        customSystemPrompt: settings.defaultSystemPrompt,
      });

      const updatedSections = [...proposal.sections];
      updatedSections[sectionIdx] = {
        ...targetSection,
        content: newContent,
        isCustomized: true,
        lastUpdated: new Date().toISOString(),
      };

      const updatedProposal = await db.updateProposal(
        id,
        { sections: updatedSections },
        `AI Section Regeneration: ${targetSection.title}`
      );

      return res.json({ success: true, proposal: updatedProposal });
    } catch (err: any) {
      console.error('Section regeneration endpoint error:', err);
      return res.status(500).json({ error: err.message || 'Failed to regenerate section' });
    }
  });

  // PDF Export Payload Generator
  app.post('/api/proposals/:id/pdf', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { style = 'branded' } = req.body;

      const proposal = await db.getProposalById(id);
      if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

      const settings = await db.getSettings();

      return res.json({
        proposal,
        settings,
        exportStyle: style,
        formattedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to render PDF payload' });
    }
  });

  // ==================== VITE / STATIC SERVING ====================
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
