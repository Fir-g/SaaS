import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import SunburstModule from 'highcharts/modules/sunburst';
import Accessibility from 'highcharts/modules/accessibility';
import { AlertTriangle } from 'lucide-react';

// Robustly initialize Highcharts modules across ESM/CJS shapes
function initModule(mod: unknown) {
	const anyMod = mod as any;
	const candidate = typeof anyMod === 'function' ? anyMod : (typeof anyMod?.default === 'function' ? anyMod.default : null);
	if (typeof candidate === 'function') {
		candidate(Highcharts);
	}
}

initModule(SunburstModule);
initModule(Accessibility);

interface RootCauseData {
  title?: string;
  percent?: number;
  children?: Array<{
    title?: string;
    percent?: number;
  }>;
}

interface SunburstChartProps {
  data: RootCauseData[];
}

type SunburstPoint = {
	id?: string;
	parent?: string;
	name?: string;
	value?: number;
};

const SunburstChart: React.FC<SunburstChartProps> = ({ data }) => {
	const [currentRootId, setCurrentRootId] = React.useState<string>('root');
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] bg-white">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No root cause data available</p>
        </div>
      </div>
    );
  }

	// Color pairs: [parent, child]
	const COLOR_PAIRS: [string, string][] = [
		['#0466c8', '#0353a4'],
		['#7d8597', '#5c677d'],
		['#7209b7', '#c8b6ff'],
		['#fdc5f5', '#f7aef8'],
		['#065a82', '#1c7293'],
		['#83bcff', '#97d2fb'],
		['#a9845a', '#d2a87d']
	];

	const points: (SunburstPoint & { color?: string })[] = [];
	const parentOf: Record<string, string | undefined> = {};

	// Root
	points.push({ id: 'root', name: 'Root Causes', color: '#111827' });

	// First level
	data.forEach((parentItem, i) => {
		const parentId = `p-${i}`;
		parentOf[parentId] = 'root';
		points.push({ id: parentId, parent: 'root', name: parentItem.title || 'Unknown', value: Math.max(parentItem.percent || 0, 0.0001) });
		(parentItem.children || []).forEach((childItem, j) => {
			const childId = `${parentId}-c-${j}`;
			parentOf[childId] = parentId;
			points.push({ id: childId, parent: parentId, name: childItem.title || 'Unknown', value: Math.max(childItem.percent || 0, 0.0001) });
		});
	});

	// Helper to find top-level index for an id
	function getTopIndex(id?: string): number {
		if (!id || id === 'root') return 0;
		let cur: string | undefined = id;
		while (cur && parentOf[cur] && parentOf[cur] !== 'root') {
			cur = parentOf[cur];
		}
		if (cur && /^p-(\d+)$/.test(cur)) {
			const m = cur.match(/^p-(\d+)$/);
			return m ? Number(m[1]) : 0;
		}
		return 0;
	}

	function getDepth(id?: string): number {
		let depth = 0;
		let cur: string | undefined = id;
		while (cur && parentOf[cur]) {
			depth += 1;
			cur = parentOf[cur];
		}
		return depth;
	}

	// Assign colors based on current root and pairs
	const coloredPoints = points.map((pt) => {
		const idx = getTopIndex(pt.id);
		const pair = COLOR_PAIRS[idx % COLOR_PAIRS.length];
		const isRoot = pt.id === currentRootId;
		const isDirectChild = parentOf[pt.id || ''] === currentRootId;
		let color: string | undefined;
		if (isRoot) {
			color = pair[0];
		} else if (isDirectChild) {
			color = pair[1];
		} else if (pt.id && pt.id !== 'root') {
			// Shade based on depth
			const d = getDepth(pt.id);
			try {
				// @ts-ignore
				color = Highcharts.color(pair[1]).brighten(Math.max(-0.6, -0.12 * (d - 1))).get();
			} catch {
				color = pair[1];
			}
		}
		return { ...pt, color };
	});

	const options: any = {
		chart: {
			height: 600,
			spacing: [6, 6, 6,6],
			backgroundColor: '#ffffff'
		},
		title: { text: undefined },
		subtitle: { text: undefined },
		credits: { enabled: false },
		tooltip: {
			useHTML: true,
			backgroundColor: 'rgba(17,24,39,0.9)',
			borderColor: 'rgba(255,255,255,0.1)',
			style: { color: '#fff' },
			pointFormatter: function () {
				const p = this as any;
				const name = String(this.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
				return `<div style="min-width:160px;padding:6px 8px;">
					<div style="font-weight:700;margin-bottom:4px;">${name}</div>
					<div style="opacity:.9">Value: <span style="color:#F59E0B;font-weight:700;">${(p.value ?? 0).toFixed(2)}%</span></div>
				</div>`;
			}
		},
		series: [
			{
				type: 'sunburst',
				data: coloredPoints as any,
				allowTraversingTree: true,
				levels: [
					{ level: 1, levelIsConstant: false, colorByPoint: false, dataLabels: { rotationMode: 'parallel', style: { fontWeight: '700', color: '#111827' } } },
					{ level: 2, colorVariation: { key: 'brightness', to: -0.4 }, dataLabels: { rotationMode: 'parallel', style: { color: '#ffffff', fontWeight: '600', textOutline: 'none' } } },
					{ level: 3, colorVariation: { key: 'brightness', to: -0.6 }, dataLabels: { rotationMode: 'parallel', style: { color: '#ffffff', fontWeight: '600', textOutline: 'none' } } }
				],
				animation: { duration: 650, easing: 'easeOutCubic' },
				borderWidth: 2,
				borderColor: '#ffffff'
			}
		],
		plotOptions: {
			sunburst: {
				cursor: 'pointer',
				allowDrillToNode: true,
				animationLimit: 1000,
				dataLabels: {
					filter: { property: 'innerArcLength', operator: '>', value: 20 },
					style: { textOutline: 'none' }
				},
				levels: undefined
			}
		},
		colors: COLOR_PAIRS.map(([p]) => p),
		breadcrumb: {
			showFullPath: true,
			style: { fontSize: '12px' }
		},
		navigation: { buttonOptions: { enabled: false } }
	};

	return (
		<div className="w-full h-full min-h-[500px] bg-white rounded-lg p-2">
			<HighchartsReact highcharts={Highcharts} options={options} immutable={true} />
    </div>
  );
};

export default SunburstChart;