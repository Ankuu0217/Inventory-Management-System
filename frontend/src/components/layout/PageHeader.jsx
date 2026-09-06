import PropTypes from 'prop-types';

/**
 * The shared header rhythm for every page: title and one-line purpose on the
 * left, a single primary action right-aligned on the same baseline.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.subtitle one line saying what the page is for
 * @param {React.ReactNode} [props.action] the screen's single primary action
 */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-16">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold leading-tight text-charcoal">{title}</h1>
        <p className="mt-4 text-sm text-steel">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  action: PropTypes.node,
};
