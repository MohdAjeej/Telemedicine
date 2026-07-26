import { Box, Breadcrumbs, Link as MuiLink, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface PageHeaderBreadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: PageHeaderBreadcrumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs sx={{ mb: 1 }} aria-label="breadcrumb">
          {breadcrumbs.map((crumb, index) =>
            crumb.href && index !== breadcrumbs.length - 1 ? (
              <MuiLink key={crumb.label} href={crumb.href} underline="hover" color="inherit">
                {crumb.label}
              </MuiLink>
            ) : (
              <Typography key={crumb.label} color="text.primary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box>{actions}</Box>}
      </Stack>
    </Box>
  );
}
