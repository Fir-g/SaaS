declare module 'highcharts';
declare module 'highcharts/modules/sunburst' {
	const SunburstModule: (H: any) => any;
	export default SunburstModule;
}
declare module 'highcharts/modules/accessibility' {
	const AccessibilityModule: (H: any) => any;
	export default AccessibilityModule;
}
declare module 'highcharts-react-official' {
	import React from 'react';
	const HighchartsReact: React.ComponentType<any>;
	export default HighchartsReact;
}

