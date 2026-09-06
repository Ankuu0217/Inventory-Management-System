import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto rounded-cards border border-ash">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
Table.displayName = 'Table';
Table.propTypes = { className: PropTypes.string };

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-paper-mist', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';
TableHeader.propTypes = { className: PropTypes.string };

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-ash', className)} {...props} />
));
TableBody.displayName = 'TableBody';
TableBody.propTypes = { className: PropTypes.string };

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors hover:bg-paper-mist', className)} {...props} />
));
TableRow.displayName = 'TableRow';
TableRow.propTypes = { className: PropTypes.string };

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('px-16 py-12 text-left align-middle text-xs font-medium text-steel', className)}
    {...props}
  />
));
TableHead.displayName = 'TableHead';
TableHead.propTypes = { className: PropTypes.string };

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-16 py-12 align-middle text-charcoal', className)} {...props} />
));
TableCell.displayName = 'TableCell';
TableCell.propTypes = { className: PropTypes.string };

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
